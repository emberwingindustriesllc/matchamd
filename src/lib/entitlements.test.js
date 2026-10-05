/**
 * Tests for centralized entitlement resolution.
 *
 * The point of these is a tripwire: FEATURE_ACCESS is the list of what we claim
 * to charge for. If someone marks a feature as free, this test records that
 * decision explicitly rather than letting it happen silently.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const supabaseMock = {
  from: vi.fn(),
};

vi.mock('@/api/supabaseClient', () => ({
  supabase: { from: (...a) => supabaseMock.from(...a) },
}));

vi.mock('@/utils', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, isReviewerAccount: () => false };
});

import {
  FEATURE_ACCESS,
  ONE_TIME_CONTENT,
  planSatisfies,
  canAccess,
  resolveEntitlements,
} from '@/lib/entitlements';

/** Chainable builder returning a fixed result. */
function q(result) {
  const b = {
    select: () => b,
    eq: () => b,
    then: (res, rej) => Promise.resolve(result).then(res, rej),
  };
  return b;
}

describe('planSatisfies', () => {
  it('treats a null/undefined requirement as always satisfied', () => {
    expect(planSatisfies('free', null)).toBe(true);
    expect(planSatisfies('free', undefined)).toBe(true);
  });

  it('orders free < premium < pro', () => {
    expect(planSatisfies('pro', 'premium')).toBe(true);
    expect(planSatisfies('premium', 'pro')).toBe(false);
    expect(planSatisfies('premium', 'premium')).toBe(true);
    expect(planSatisfies(undefined, 'premium')).toBe(false);
  });
});

describe('canAccess', () => {
  const premium = { plan: 'premium', content: new Set(), isReviewer: false };
  const pro = { plan: 'pro', content: new Set(), isReviewer: false };
  const free = { plan: 'free', content: new Set(), isReviewer: false };

  it('grants free-tier features to everyone', () => {
    for (const f of ['PROGRAM_SEARCH', 'PROGRAM_DETAIL', 'SAVED_SEARCHES', 'COST_CALCULATOR', 'DEADLINES', 'COMMUNITY_READ']) {
      expect(FEATURE_ACCESS[f], `${f} should be declared free`).toBeNull();
      expect(canAccess(free, f)).toBe(true);
    }
  });

  it('denies premium features to the free tier', () => {
    expect(canAccess(free, 'PROFILE_EXPORTS')).toBe(false);
    expect(canAccess(free, 'FIT_ANALYSIS')).toBe(false);
    expect(canAccess(free, 'DEADLINE_ALERTS')).toBe(false);
    expect(canAccess(free, 'DATA_EXPORT')).toBe(false);
  });

  it('grants premium features to premium and above', () => {
    expect(canAccess(premium, 'PROFILE_EXPORTS')).toBe(true);
    expect(canAccess(pro, 'PROFILE_EXPORTS')).toBe(true);
  });

  it('reserves the human review tier for pro', () => {
    expect(canAccess(premium, 'ASYNC_REVIEW')).toBe(false);
    expect(canAccess(pro, 'ASYNC_REVIEW')).toBe(true);
  });

  it('sells one-time content by content_id, independent of plan', () => {
    const bought = { plan: 'free', content: new Set([ONE_TIME_CONTENT.INTERVIEW_COURSE]) };
    expect(canAccess(bought, 'INTERVIEW_COURSE')).toBe(true);
    // A pro subscriber has not necessarily bought the course.
    expect(canAccess(pro, 'INTERVIEW_COURSE')).toBe(false);
  });

  it('fails closed on an unknown feature name', () => {
    expect(canAccess(pro, 'NOT_A_REAL_FEATURE')).toBe(false);
  });

  it('denies everything when entitlements are missing', () => {
    expect(canAccess(null, 'INTERVIEW_COURSE')).toBe(false);
  });

  it('lets a reviewer account through everything', () => {
    const reviewer = { plan: 'free', content: new Set(), isReviewer: true };
    expect(canAccess(reviewer, 'ASYNC_REVIEW')).toBe(true);
    expect(canAccess(reviewer, 'INTERVIEW_COURSE')).toBe(true);
  });
});

describe('resolveEntitlements', () => {
  beforeEach(() => {
    supabaseMock.from.mockReset();
    localStorage.clear();
  });

  it('reads plan and content from the database', async () => {
    supabaseMock.from.mockImplementation((table) =>
      table === 'subscriptions'
        ? q({ data: [{ plan: 'premium', status: 'active' }], error: null })
        : q({ data: [{ content_id: 'interview_premium' }], error: null })
    );

    const ent = await resolveEntitlements({ id: 'u1' });
    expect(ent.plan).toBe('premium');
    expect(ent.content.has('interview_premium')).toBe(true);
    expect(canAccess(ent, 'INTERVIEW_COURSE')).toBe(true);
    expect(canAccess(ent, 'PROFILE_EXPORTS')).toBe(true);
    expect(canAccess(ent, 'ASYNC_REVIEW')).toBe(false);
  });

  it('falls back to free when the query fails, without throwing', async () => {
    supabaseMock.from.mockImplementation(() => {
      throw new Error('network down');
    });

    const ent = await resolveEntitlements({ id: 'u1' });
    expect(ent.plan).toBe('free');
    expect(canAccess(ent, 'PROGRAM_SEARCH')).toBe(true);
    expect(canAccess(ent, 'INTERVIEW_COURSE')).toBe(false);
  });

  it('ignores a non-active subscription row', async () => {
    supabaseMock.from.mockImplementation((table) =>
      table === 'subscriptions'
        ? q({ data: [{ plan: 'pro', status: 'canceled' }], error: null })
        : q({ data: [], error: null })
    );

    const ent = await resolveEntitlements({ id: 'u1' });
    expect(ent.plan).toBe('free');
  });

  it('honours a localStorage demo subscription (issue #3 flags this)', async () => {
    supabaseMock.from.mockImplementation(() => q({ data: [], error: null }));
    localStorage.setItem(
      'matchamd_active_subscription',
      JSON.stringify({ plan: 'pro', status: 'active' })
    );

    const ent = await resolveEntitlements({ id: 'u1' });
    expect(ent.plan).toBe('pro');
    // This is exactly the hole in issue #3 -- documented, not silently relied on.
  });

  it('returns free for a logged-out user', async () => {
    supabaseMock.from.mockImplementation(() => q({ data: [], error: null }));
    const ent = await resolveEntitlements(null);
    expect(ent.plan).toBe('free');
    expect(ent.content.size).toBe(0);
  });
});