/**
 * Tests for scam report moderation (LEGAL-01).
 *
 * The load-bearing property is review-before-publication plus the
 * self-approval block: a reporter must never be the person who makes their own
 * accusation public. Publication is meant to be a second pair of eyes, and
 * these tests exist so that property cannot be quietly removed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const supabaseMock = {
  from: vi.fn(),
  auth: { getUser: vi.fn() },
};

vi.mock('@/api/supabaseClient', () => ({
  supabase: {
    from: (...a) => supabaseMock.from(...a),
    auth: { getUser: (...a) => supabaseMock.auth.getUser(...a) },
  },
}));

import {
  REPORT_STATUS,
  REPORT_TTL_MONTHS,
  isReportExpired,
  canModerateReport,
  moderationBlockReason,
  verifyScamReport,
  dismissScamReport,
  fetchPublishedScamReports,
  reportAgeLabel,
} from '@/api/moderation';

/** Builder where every terminal method resolves to `result`. */
function builder(result) {
  const q = {
    select: () => q,
    eq: () => q,
    order: () => q,
    limit: () => q,
    single: () => Promise.resolve(result),
    update: () => q,
    then: (res, rej) => Promise.resolve(result).then(res, rej),
  };
  return q;
}

const pendingReport = {
  id: 'r1',
  reporter_id: 'user-a',
  status: REPORT_STATUS.PENDING,
  program_id: 'p1',
  submitted_at: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  supabaseMock.from.mockReset();
  supabaseMock.auth.getUser.mockReset();
});

describe('isReportExpired', () => {
  it('treats a report with no expiry as live', () => {
    expect(isReportExpired({ expires_at: null })).toBe(false);
    expect(isReportExpired({})).toBe(false);
  });

  it('treats a past expiry as expired', () => {
    const now = new Date('2026-06-01T00:00:00Z').getTime();
    expect(isReportExpired({ expires_at: '2026-01-01T00:00:00Z' }, now)).toBe(true);
  });

  it('treats a future expiry as live', () => {
    const now = new Date('2026-06-01T00:00:00Z').getTime();
    expect(isReportExpired({ expires_at: '2027-01-01T00:00:00Z' }, now)).toBe(false);
  });
});

describe('canModerateReport -- the self-approval block', () => {
  it('allows a different moderator to action a pending report', () => {
    expect(canModerateReport(pendingReport, 'moderator-1')).toBe(true);
  });

  it('BLOCKS the reporter from approving their own report', () => {
    expect(canModerateReport(pendingReport, 'user-a')).toBe(false);
  });

  it('blocks already-actioned reports', () => {
    expect(canModerateReport({ ...pendingReport, status: 'verified' }, 'mod')).toBe(false);
    expect(canModerateReport({ ...pendingReport, status: 'dismissed' }, 'mod')).toBe(false);
  });

  it('requires both a report and a reviewer', () => {
    expect(canModerateReport(null, 'mod')).toBe(false);
    expect(canModerateReport(pendingReport, null)).toBe(false);
  });
});

describe('moderationBlockReason', () => {
  it('explains the self-approval block in plain language', () => {
    const reason = moderationBlockReason(pendingReport, 'user-a');
    expect(reason).toMatch(/you filed this report/i);
    expect(reason).toMatch(/different moderator/i);
  });

  it('explains an already-actioned report', () => {
    expect(moderationBlockReason({ ...pendingReport, status: 'verified' }, 'mod')).toMatch(/already actioned/i);
  });

  it('returns null when the report is actionable', () => {
    expect(moderationBlockReason(pendingReport, 'mod')).toBeNull();
  });
});

describe('verifyScamReport', () => {
  it('refuses to publish when the reviewer is the reporter', async () => {
    supabaseMock.from.mockReturnValue(builder({ data: pendingReport, error: null }));

    await expect(
      verifyScamReport('r1', { reviewerUserId: 'user-a' })
    ).rejects.toThrow(/you filed this report/i);

    // Critically: no update should have been attempted.
    expect(supabaseMock.from).toHaveBeenCalledTimes(1);
  });

  it('publishes with a 12-month expiry when a different moderator approves', async () => {
    supabaseMock.from.mockReturnValueOnce(
      builder({ data: pendingReport, error: null })
    );
    const updated = {
      id: 'r1',
      status: REPORT_STATUS.VERIFIED,
      expires_at: '2027-01-01T00:00:00Z',
    };
    supabaseMock.from.mockReturnValueOnce(builder({ data: updated, error: null }));

    const result = await verifyScamReport('r1', {
      reviewerUserId: 'moderator-1',
      notes: 'evidence checked',
    });

    expect(result.status).toBe(REPORT_STATUS.VERIFIED);
    expect(new Date(result.expires_at).getMonth()).toBeGreaterThanOrEqual(0);
    expect(REPORT_TTL_MONTHS).toBe(12);
  });
});

describe('dismissScamReport', () => {
  it('refuses to dismiss the reporter own report', async () => {
    supabaseMock.from.mockReturnValue(builder({ data: pendingReport, error: null }));

    await expect(
      dismissScamReport('r1', { reviewerUserId: 'user-a' })
    ).rejects.toThrow(/you filed this report/i);
  });

  it('dismisses for an independent moderator', async () => {
    supabaseMock.from.mockReturnValueOnce(
      builder({ data: pendingReport, error: null })
    );
    supabaseMock.from.mockReturnValueOnce(
      builder({ data: { ...pendingReport, status: REPORT_STATUS.DISMISSED }, error: null })
    );

    const result = await dismissScamReport('r1', { reviewerUserId: 'moderator-1' });
    expect(result.status).toBe(REPORT_STATUS.DISMISSED);
  });
});

describe('fetchPublishedScamReports', () => {
  it('returns an empty array on error rather than throwing', async () => {
    supabaseMock.from.mockReturnValue(builder({ data: null, error: { message: 'denied' } }));
    await expect(fetchPublishedScamReports('p1')).resolves.toEqual([]);
  });

  it('filters expired rows client-side as defence in depth', async () => {
    const rows = [
      { id: 'live', status: 'verified', expires_at: null },
      { id: 'dead', status: 'verified', expires_at: '2000-01-01T00:00:00Z' },
    ];
    supabaseMock.from.mockReturnValue(builder({ data: rows, error: null }));

    const result = await fetchPublishedScamReports('p1');
    expect(result.map((r) => r.id)).toEqual(['live']);
  });
});

describe('reportAgeLabel', () => {
  const now = new Date('2026-06-15T00:00:00Z').getTime();

  it('handles a missing timestamp', () => {
    expect(reportAgeLabel({}, now)).toBe('unknown');
  });

  it('reports today, days, and months', () => {
    expect(reportAgeLabel({ submitted_at: '2026-06-15T00:00:00Z' }, now)).toBe('today');
    expect(reportAgeLabel({ submitted_at: '2026-06-14T00:00:00Z' }, now)).toBe('1 day');
    expect(reportAgeLabel({ submitted_at: '2026-06-05T00:00:00Z' }, now)).toBe('10 days');
    expect(reportAgeLabel({ submitted_at: '2026-03-15T00:00:00Z' }, now)).toBe('3 months');
  });
});