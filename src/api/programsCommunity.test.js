/**
 * Regression tests for the ProgramDetail community data wiring.
 *
 * ProgramDetail previously loaded notes and scam reports via
 * Promise.resolve([]), so both tabs were permanently empty even when the
 * tables had rows. These tests pin the load path so it cannot silently
 * regress to a stub again.
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

/** Minimal PostgREST builder: supports select/eq/order/limit/single and or(). */
function builder(result, { failOn = null } = {}) {
  let last = 'select';
  const q = {
    select: () => {
      if (failOn === 'select') return Promise.resolve(result);
      last = 'select';
      return q;
    },
    eq: () => {
      if (failOn === 'eq') return Promise.resolve(result);
      return q;
    },
    update: () => {
      last = 'update';
      return q;
    },
    insert: () => q,
    order: () => q,
    limit: () => q,
    single: () => Promise.resolve(result),
    then: (res, rej) => Promise.resolve(result).then(res, rej),
  };
  void last;
  return q;
}

describe('fetchProgramNotes', () => {
  beforeEach(() => {
    supabaseMock.from.mockReset();
    supabaseMock.auth.getUser.mockReset();
  });

  it('returns rows for the requested program', async () => {
    const rows = [{ id: 'n1', title: 'Great APD', content: 'Very organized', program_id: 'p1' }];
    supabaseMock.from.mockReturnValue(builder({ data: rows, error: null }));

    const { fetchProgramNotes } = await import('@/api/programs');
    const notes = await fetchProgramNotes('p1');

    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('Great APD');
    expect(supabaseMock.from).toHaveBeenCalledWith('program_notes');
  });

  it('returns an empty array on error rather than throwing', async () => {
    // This is the auth.users join failing under the anon key, which is what
    // happens in production on the anon-key path.
    supabaseMock.from.mockReturnValue(builder({ data: null, error: { message: 'permission denied' } }));

    const { fetchProgramNotes } = await import('@/api/programs');
    const notes = await fetchProgramNotes('p1');

    expect(Array.isArray(notes)).toBe(true);
    expect(notes).toHaveLength(0);
  });
});

describe('fetchScamReports', () => {
  beforeEach(() => {
    supabaseMock.from.mockReset();
  });

  it('returns rows filtered to one program when given an id', async () => {
    const rows = [{ id: 'r1', program_id: 'p1', status: 'pending' }];
    supabaseMock.from.mockReturnValue(builder({ data: rows, error: null }));

    const { fetchScamReports } = await import('@/api/programs');
    const reports = await fetchScamReports('p1');

    expect(reports).toHaveLength(1);
    expect(supabaseMock.from).toHaveBeenCalledWith('scam_reports');
  });

  it('returns an empty array on error rather than throwing', async () => {
    supabaseMock.from.mockReturnValue(builder({ data: null, error: { message: 'permission denied' } }));

    const { fetchScamReports } = await import('@/api/programs');
    const reports = await fetchScamReports('p1');

    expect(Array.isArray(reports)).toBe(true);
    expect(reports).toHaveLength(0);
  });
});

describe('updateScamReportStatus', () => {
  beforeEach(() => {
    supabaseMock.from.mockReset();
    supabaseMock.auth.getUser.mockReset();
  });

  it('rejects when the caller is not a verified contributor', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'someone@example.com' } },
    });
    supabaseMock.from.mockReturnValue(
      builder({ data: { user_id: 'u1', verified_contributor: false }, error: null })
    );

    const { updateScamReportStatus } = await import('@/api/programs');
    await expect(updateScamReportStatus('r1', 'verified')).rejects.toThrow(/permission/i);
  });

  it('updates the status for a verified contributor', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'mod@example.com' } },
    });
    const updated = [{ id: 'r1', status: 'verified' }];
    supabaseMock.from.mockReturnValue(
      builder({ data: { user_id: 'u1', verified_contributor: true }, error: null })
    );
    supabaseMock.from.mockReturnValueOnce(
      builder({ data: { user_id: 'u1', verified_contributor: true }, error: null })
    );
    supabaseMock.from.mockReturnValueOnce(builder({ data: updated, error: null }));

    const { updateScamReportStatus } = await import('@/api/programs');
    const result = await updateScamReportStatus('r1', 'verified', 'confirmed scam');

    expect(result[0].status).toBe('verified');
  });
});