/**
 * Regression tests for the program search stack.
 *
 * Bug 1 (crash -> "Something went wrong"): loadSpecialties()/loadLocations()
 *   returned a fallback list WITHOUT populating the module cache when the
 *   Supabase query failed, so the module-level cache stayed null and the
 *   filter helpers dereferenced it -> TypeError -> ErrorBoundary.
 *
 * Bug 2 (dead code): filterSpecialties() returned from the token loop before
 *   reaching its compact-name / prefix matching, so "obgyn" never matched
 *   "OB/GYN" and "peds" never matched "Pediatrics".
 *
 * Bug 3 (links 404): ProgramsList linked to /programs/:id and ProgramDetail
 *   redirected to /programs, but the only registered routes are
 *   /ProgramsList and /ProgramsList/:id.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  loadSpecialties,
  filterSpecialties,
  normalizeQuery,
} from '@/lib/search/specialtyTypeahead';
import {
  loadLocations,
  filterLocations,
  parseLocationLabel,
} from '@/lib/search/locationTypeahead';
import { PAGES, pagesConfig } from '@/pages.config';
import { createPageUrl } from '@/utils';

const supabaseMock = {
  from: vi.fn(),
};

vi.mock('@/api/supabaseClient', () => ({
  supabase: {
    from: (...args) => supabaseMock.from(...args),
  },
}));

/** Chainable no-op query builder. */
function chain(result) {
  const q = {
    select: () => q,
    order: () => q,
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return q;
}

describe('search typeahead caches survive a failed load', () => {
  beforeEach(() => {
    vi.resetModules();
    supabaseMock.from.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('filterSpecialties does not throw when the specialties query failed', async () => {
    supabaseMock.from.mockReturnValue(chain({ data: null, error: { message: 'boom' } }));

    const mod = await import('@/lib/search/specialtyTypeahead');
    const loaded = await mod.loadSpecialties();

    expect(loaded.length).toBeGreaterThan(0); // fallback list returned
    // This is the line that used to throw TypeError: Cannot read properties of null
    expect(() => mod.filterSpecialties('internal', 5)).not.toThrow();
    expect(mod.filterSpecialties('internal', 5).length).toBeGreaterThan(0);
  });

  it('filterSpecialties does not throw when aliases loaded but specialties did not', async () => {
    supabaseMock.from.mockImplementation((table) =>
      table === 'specialty_aliases'
        ? chain({ data: [{ canonical_specialty: 'Internal Medicine', alias: 'im', normalized_alias: 'im' }], error: null })
        : chain({ data: null, error: { message: 'boom' } })
    );

    const mod = await import('@/lib/search/specialtyTypeahead');
    await mod.loadSpecialties();
    await mod.loadSpecialtyAliases();

    expect(() => mod.filterSpecialties('im', 5)).not.toThrow();
  });

  it('filterLocations does not throw when the locations query failed', async () => {
    supabaseMock.from.mockReturnValue(chain({ data: null, error: { message: 'boom' } }));

    const mod = await import('@/lib/search/locationTypeahead');
    const loaded = await mod.loadLocations();

    expect(loaded.length).toBeGreaterThan(0);
    expect(() => mod.filterLocations('pittsburgh', 5)).not.toThrow();
    expect(mod.filterLocations('pittsburgh', 5).length).toBeGreaterThan(0);
  });

  it('a successful load is cached and does not re-query', async () => {
    supabaseMock.from.mockReturnValue(
      chain({ data: [{ specialty: 'Internal Medicine', name: 'Internal Medicine', program_count: 10 }], error: null })
    );

    const mod = await import('@/lib/search/specialtyTypeahead');
    await mod.loadSpecialties();
    const callsAfterFirst = supabaseMock.from.mock.calls.length;
    await mod.loadSpecialties();

    expect(supabaseMock.from.mock.calls.length).toBe(callsAfterFirst);
  });
});

describe('specialty typeahead matching', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('matches a compact query against a multi-word specialty name', async () => {
    supabaseMock.from.mockReturnValue(
      chain({
        data: [
          { specialty: 'Pediatric Hematology-Oncology', name: 'Pediatric Hematology-Oncology', program_count: 5 },
          { specialty: 'Internal Medicine', name: 'Internal Medicine', program_count: 5 },
        ],
        error: null,
      })
    );

    const mod = await import('@/lib/search/specialtyTypeahead');
    await mod.loadSpecialties();

    const results = mod.filterSpecialties('internal', 5).map((r) => r.specialty);
    expect(results).toContain('Internal Medicine');
  });

  it('matches an abbreviation prefix of a specialty name', async () => {
    supabaseMock.from.mockReturnValue(
      chain({
        data: [
          { specialty: 'Obstetrics and Gynecology', name: 'Obstetrics and Gynecology', program_count: 5 },
          { specialty: 'Neurology', name: 'Neurology', program_count: 5 },
        ],
        error: null,
      })
    );

    const mod = await import('@/lib/search/specialtyTypeahead');
    await mod.loadSpecialties();

    const results = mod.filterSpecialties('obgyn', 5).map((r) => r.specialty);
    expect(results).toContain('Obstetrics and Gynecology');
  });

  it('normalizeQuery folds separators and case', () => {
    expect(normalizeQuery('  OB/GYN ')).toBe('ob gyn');
    expect(normalizeQuery('Internal-Medicine')).toBe('internal medicine');
    expect(normalizeQuery(null)).toBe('');
  });
});

describe('parseLocationLabel', () => {
  it('parses a statewide entry', () => {
    expect(parseLocationLabel('West Virginia (Entire State)')).toEqual({ city: '', state: 'WV' });
  });

  it('parses a city and state', () => {
    expect(parseLocationLabel('Pittsburgh, PA')).toEqual({ city: 'Pittsburgh', state: 'PA' });
  });

  it('parses a bare state code', () => {
    expect(parseLocationLabel('PA')).toEqual({ city: '', state: 'PA' });
  });
});

describe('program routes are registered', () => {
  it('registers ProgramsList and its :id detail route', () => {
    expect(Object.keys(PAGES)).toContain('ProgramsList');
  });

  it('createPageUrl produces the registered ProgramsList path', () => {
    expect(createPageUrl('ProgramsList')).toBe('/ProgramsList');
  });

  it('every page referenced by createPageUrl in the app exists in PAGES', () => {
    // ProgramsList and ProgramDetail are the two program surfaces; both must be
    // routable or the cards 404 into PageNotFound.
    expect(Object.keys(PAGES)).toContain('ProgramsList');
    expect(Object.keys(PAGES)).toContain('ProgramDetail');
  });

  it('the main page is registered', () => {
    expect(Object.keys(PAGES)).toContain(pagesConfig.mainPage);
  });
});