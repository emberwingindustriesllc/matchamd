/**
 * Tests for the server-authoritative entitlement path (issue #3).
 *
 * The hole being closed: entitlements were decided by the client, so a
 * published localStorage/table patch would unlock every paid feature forever.
 * Now the client must ask the `getEntitlements` Edge Function, which verifies
 * the JWT and cross-checks Stripe.
 *
 * The load-bearing property is FAIL CLOSED: any error, malformed response, or
 * missing key must deny paid features rather than grant them.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const invoke = vi.fn();
vi.mock('@/api/supabaseClient', () => ({
  supabase: { functions: { invoke: (...a) => invoke(...a) } },
}));

vi.mock('@/utils', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, isReviewerAccount: () => false };
});

import {
  fetchServerEntitlements,
  entitlementsFromServer,
  canAccess,
} from '@/lib/entitlements';

beforeEach(() => {
  invoke.mockReset();
});

const PAID_RESPONSE = {
  plan: 'premium',
  entitlements: {
    PROGRAM_SEARCH: true,
    PROGRAM_DETAIL: true,
    SAVED_SEARCHES: true,
    COST_CALCULATOR: true,
    DEADLINES: true,
    COMMUNITY_READ: true,
    GUIDES_CORE: true,
    PROFILE_EXPORTS: true,
    FIT_ANALYSIS: true,
    DEADLINE_ALERTS: true,
    COMMUNITY_POST: true,
    DATA_EXPORT: true,
    INTERVIEW_COURSE: false,
    SURGERY_GUIDE: false,
    QUIZ_PACK: false,
    ASYNC_REVIEW: false,
  },
  content: [],
};

describe('fetchServerEntitlements', () => {
  it('returns the server answer on success', async () => {
    invoke.mockResolvedValue({ data: PAID_RESPONSE, error: null });
    const result = await fetchServerEntitlements();
    expect(result.plan).toBe('premium');
    expect(result.entitlements.PROFILE_EXPORTS).toBe(true);
    expect(result.entitlements.ASYNC_REVIEW).toBe(false);
  });

  it('never grants paid access when the function errors', async () => {
    invoke.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const result = await fetchServerEntitlements();
    expect(result.plan).toBe('free');
    expect(result.entitlements.PROFILE_EXPORTS).toBe(false);
    expect(result.entitlements.ASYNC_REVIEW).toBe(false);
    expect(result.entitlements.INTERVIEW_COURSE).toBe(false);
  });

  it('never grants paid access when the call throws', async () => {
    invoke.mockRejectedValue(new Error('network down'));
    const result = await fetchServerEntitlements();
    expect(result.plan).toBe('free');
    expect(result.entitlements.PROFILE_EXPORTS).toBe(false);
  });

  it('never grants paid access on a malformed response', async () => {
    invoke.mockResolvedValue({ data: { nope: true }, error: null });
    const result = await fetchServerEntitlements();
    expect(result.plan).toBe('free');
    expect(result.entitlements.ASYNC_REVIEW).toBe(false);
  });

  it('never grants paid access when entitlements is empty', async () => {
    invoke.mockResolvedValue({ data: { plan: 'pro', entitlements: {} }, error: null });
    const result = await fetchServerEntitlements();
    expect(result.entitlements.PROFILE_EXPORTS).toBe(false);
  });

  it('still grants free features while offline', async () => {
    // A plane is not a paywall: search must keep working when the server is
    // unreachable. This is the one thing we deliberately allow without the server.
    invoke.mockRejectedValue(new Error('offline'));
    const result = await fetchServerEntitlements();
    expect(result.entitlements.PROGRAM_SEARCH).toBe(true);
    expect(result.entitlements.PROGRAM_DETAIL).toBe(true);
    expect(result.entitlements.SAVED_SEARCHES).toBe(true);
  });
});

describe('canAccess with a server-verified map', () => {
  it('follows the server map exactly', () => {
    const ent = entitlementsFromServer(PAID_RESPONSE);
    expect(canAccess(ent, 'PROFILE_EXPORTS')).toBe(true);
    expect(canAccess(ent, 'INTERVIEW_COURSE')).toBe(false);
    expect(canAccess(ent, 'PROGRAM_SEARCH')).toBe(true);
  });

  it('denies a feature the server did not mention at all', () => {
    const ent = entitlementsFromServer({ plan: 'pro', entitlements: { PROGRAM_SEARCH: true } });
    // Not present in the server map -> not `=== true` -> denied.
    expect(canAccess(ent, 'ASYNC_REVIEW')).toBe(false);
    expect(canAccess(ent, 'PROFILE_EXPORTS')).toBe(false);
  });

  it('cannot be talked into granting by a higher plan name', () => {
    // The plan field alone must not unlock anything -- only the boolean map does.
    const ent = entitlementsFromServer({ plan: 'pro', entitlements: {} });
    expect(canAccess(ent, 'ASYNC_REVIEW')).toBe(false);
  });

  it('does not fall back to the local cache when serverVerified is set', () => {
    const ent = entitlementsFromServer(PAID_RESPONSE);
    ent.content.add('interview_premium'); // forge the local set
    expect(canAccess(ent, 'INTERVIEW_COURSE')).toBe(false);
  });
});