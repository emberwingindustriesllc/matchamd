/**
 * TEMPORARY sweep: mount every routed page with real data to find render
 * crashes that the thin-Supabase-mock suite cannot see.
 */
import React from 'react';
import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import realRows from './programRows.fixture.json';

vi.mock('@/api/programs', () => {
  const rows = realRows;
  const ok = async () => ({ data: rows, totalCount: rows.length });
  return {
    fetchPrograms: vi.fn(ok),
    fetchSavedSearches: vi.fn().mockResolvedValue([]),
    saveSearch: vi.fn(),
    deleteSavedSearch: vi.fn(),
    multiSearch: vi.fn().mockResolvedValue({ data: rows, error: null }),
    fetchProgramById: vi.fn().mockResolvedValue(rows[0]),
    createProgram: vi.fn(),
    createProgramNote: vi.fn(),
    voteNoteHelpful: vi.fn(),
    createScamReport: vi.fn(),
    updateScamReportStatus: vi.fn(),
    fetchProgramNotes: vi.fn().mockResolvedValue([]),
    fetchScamReports: vi.fn().mockResolvedValue([]),
  };
});

vi.mock('@/lib/search/multiSearch', () => ({
  multiSearch: vi.fn().mockResolvedValue({ data: realRows, error: null }),
  defaultSearchState: {
    programTypes: [], specialties: [], locations: [], searchQuery: '',
    filters: {}, pagination: { limit: 100, offset: 0 },
  },
  buildSearchParams: () => ({}),
  resetPagination: (s) => s,
  nextPage: (s) => s,
}));

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 't@example.com' },
    profile: { usmle_step1_score: 230, usmle_step2_score: 240, visa_status: 'j1' },
    session: { user: { id: 'u1' } },
    isLoadingAuth: false,
    isAuthenticated: true,
    authResolved: true,
    logout: vi.fn(),
    navigateToLogin: vi.fn(),
  }),
  AuthProvider: ({ children }) => children,
}));

const wrap = (ui) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

const PAGES = {
  AdminModeration: () => import('@/pages/AdminModeration'),
  AnkiGuide: () => import('@/pages/AnkiGuide'),
  BookCatalog: () => import('@/pages/BookCatalog'),
  Community: () => import('@/pages/Community'),
  Dashboard: () => import('@/pages/Dashboard'),
  Deadlines: () => import('@/pages/Deadlines'),
  GuideDetail: () => import('@/pages/GuideDetail'),
  Guides: () => import('@/pages/Guides'),
  IMGPrograms: () => import('@/pages/IMGPrograms'),
  Legal: () => import('@/pages/Legal'),
  MatchCostCalculator: () => import('@/pages/MatchCostCalculator'),
  Mentors: () => import('@/pages/Mentors'),
  Notifications: () => import('@/pages/Notifications'),
  Onboarding: () => import('@/pages/Onboarding'),
  PostDetail: () => import('@/pages/PostDetail'),
  Profile: () => import('@/pages/Profile'),
  ProgramDetail: () => import('@/pages/ProgramDetail'),
  ProgramsList: () => import('@/pages/ProgramsList'),
  ResearchOpportunities: () => import('@/pages/ResearchOpportunities'),
  Subscription: () => import('@/pages/Subscription'),
  SurgeryGuide: () => import('@/pages/SurgeryGuide'),
  USMLEQuizPack: () => import('@/pages/USMLEQuizPack'),
  InterviewCourse: () => import('@/pages/InterviewCourse'),
};

describe('page render sweep', () => {
  for (const [name, load] of Object.entries(PAGES)) {
    it(`${name} mounts`, async () => {
      const mod = await load();
      const Page = mod.default;
      let err = null;
      try {
        render(wrap(<Page />));
        await new Promise((r) => setTimeout(r, 40));
        if (screen.queryByText(/Something went wrong/i)) err = 'BOUNDARY SHOWN';
      } catch (e) {
        err = `${e.name}: ${e.message}`;
      }
      if (err) {
        console.log(`\n### CRASH ${name}: ${err}\n`);
        throw new Error(`${name} -> ${err}`);
      }
    }, 60000);
  }
});
