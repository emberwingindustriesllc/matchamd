/**
 * Regression test for the "Something went wrong" crash on the programs page.
 *
 * Root cause: `PROGRAM_TYPES` in ProgramsList.jsx contained
 * `{ value: '', label: 'All Types' }` and was rendered into a Radix <Select>.
 * Radix reserves the empty string to mean "no selection / show placeholder"
 * and THROWS on a SelectItem that claims it:
 *
 *   Error: A <Select.Item /> must have a value prop that is not an empty
 *   string. This is because the Select value can be set to an empty string to
 *   clear the selection and show the placeholder.
 *
 * That throw happens during render, so it propagated to the app-level
 * ErrorBoundary and replaced the whole page with "Something went wrong".
 *
 * Why nothing caught it: every existing test mocks @/api/supabaseClient with a
 * stub too thin to render a page at all, so no page was ever mounted with real
 * rows. These tests mount the real pages with REAL production row shapes.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import realRows from './programRows.fixture.json';

const fetchProgramsMock = vi.fn();
vi.mock('@/api/programs', () => ({
  fetchPrograms: (...a) => fetchProgramsMock(...a),
  fetchSavedSearches: vi.fn().mockResolvedValue([]),
  saveSearch: vi.fn(),
  deleteSavedSearch: vi.fn(),
  multiSearch: vi.fn().mockResolvedValue({ data: [], error: null }),
  fetchProgramById: vi.fn(),
  createProgram: vi.fn(),
}));

vi.mock('@/lib/search/multiSearch', () => ({
  multiSearch: vi.fn().mockResolvedValue({ data: [], error: null }),
  defaultSearchState: {
    programTypes: [], specialties: [], locations: [], searchQuery: '',
    filters: {}, pagination: { limit: 100, offset: 0 },
  },
  buildSearchParams: () => ({}),
}));

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 't@example.com' },
    profile: { usmle_step2_score: 240 },
    isLoadingAuth: false,
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }) => children,
}));

import ProgramsList from '@/pages/ProgramsList';
import IMGPrograms from '@/pages/IMGPrograms';

const wrap = (ui) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('programs pages render with real production rows', () => {
  beforeEach(() => {
    fetchProgramsMock.mockReset();
    fetchProgramsMock.mockResolvedValue({
      data: realRows,
      totalCount: realRows.length,
    });
  });

  it('ProgramsList mounts and renders cards (the Select.Item crash)', async () => {
    render(wrap(<ProgramsList />));
    await waitFor(() => expect(fetchProgramsMock).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(/Something went wrong/i)).toBeNull();
    // Cards actually rendered from the real rows.
    expect(screen.getAllByText(/Internal Medicine|Pediatrics|Surgery|Family Medicine/i).length)
      .toBeGreaterThan(0);
  });

  it('ProgramsList offers an "All Types" option without an empty value', async () => {
    render(wrap(<ProgramsList />));
    await new Promise((r) => setTimeout(r, 50));
    // The sentinel must never be the empty string.
    const html = document.body.innerHTML;
    expect(html).not.toMatch(/data-radix-collection-item[^>]*value=""/);
  });

  it('IMGPrograms mounts and renders without crashing', async () => {
    render(wrap(<IMGPrograms />));
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(/Something went wrong/i)).toBeNull();
  });
});

/**
 * The typeahead loaders are called fire-and-forget from a mount effect
 * (ChipSearchBar: `loadSpecialties(); loadLocations();`). If the Supabase call
 * THROWS rather than returning { error }, the rejection used to escape as an
 * unhandled rejection and left the module cache null -- the original
 * null-cache crash. Both paths must populate the fallback.
 */
describe('typeahead loaders never reject and always populate the cache', () => {
  it('loadSpecialties resolves even when the client throws', async () => {
    vi.resetModules();
    vi.doMock('@/api/supabaseClient', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            order: () => { throw new TypeError('boom'); },
          }),
        }),
      },
    }));
    const mod = await import('./search/specialtyTypeahead');
    await expect(mod.loadSpecialties()).resolves.toBeTruthy();
    // And the filter must work off the populated cache, not null.
    expect(() => mod.filterSpecialties('cardio')).not.toThrow();
  });

  it('loadLocations resolves even when the client throws', async () => {
    vi.resetModules();
    vi.doMock('@/api/supabaseClient', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            order: () => { throw new TypeError('boom'); },
          }),
        }),
      },
    }));
    const mod = await import('./search/locationTypeahead');
    await expect(mod.loadLocations()).resolves.toBeTruthy();
    expect(() => mod.filterLocations('boston')).not.toThrow();
  });
});
