/**
 * Tests for the denormalized note author name.
 *
 * The community cards used to read the author from `note.user.user_metadata`,
 * which came from a `user:auth.users(...)` embed. That embed needs elevated
 * privileges and fails under the anon key, so every note rendered as
 * "Unknown". The fix writes `author_display_name` onto the row at insert time,
 * so these tests pin that the insert actually carries the name -- and that a
 * missing/unreadable profile degrades to null instead of failing the post.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const supabaseMock = {
  from: vi.fn(),
  auth: { getSession: vi.fn() },
};

vi.mock('@/api/supabaseClient', () => ({
  supabase: {
    from: (...a) => supabaseMock.from(...a),
    auth: { getSession: (...a) => supabaseMock.auth.getSession(...a) },
    // Programs now read the LOCAL session (getSession) instead of making a
    // network getUser() call, to avoid concurrent refresh-token races.
  },
}));

/**
 * Minimal PostgREST builder that records what was inserted.
 * select/eq/single return the configured result; insert captures its argument.
 */
function builder(result, { onInsert } = {}) {
  const q = {
    select: () => q,
    eq: () => q,
    order: () => q,
    limit: () => q,
    insert: (payload) => {
      onInsert?.(payload);
      return q;
    },
    single: () => Promise.resolve(result),
    then: (res, rej) => Promise.resolve(result).then(res, rej),
  };
  return q;
}

const NOTE = { title: 'Great APD', content: 'Very organized', note_type: 'experience' };

describe('createProgramNote author_display_name', () => {
  beforeEach(() => {
    supabaseMock.from.mockReset();
    supabaseMock.auth.getSession.mockReset();
  });

  it('includes author_display_name from the user profile in the insert payload', async () => {
    supabaseMock.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });

    const inserts = [];
    // First from() is the user_profiles lookup, second is the program_notes insert.
    supabaseMock.from
      .mockReturnValueOnce(builder({ data: { display_name: 'Dr. Rivera' }, error: null }))
      .mockReturnValueOnce(
        builder({ data: { id: 'n1' }, error: null }, { onInsert: (p) => inserts.push(p) })
      );

    const { createProgramNote } = await import('@/api/programs');
    await createProgramNote('p1', NOTE);

    expect(supabaseMock.from).toHaveBeenCalledWith('user_profiles');
    expect(inserts).toHaveLength(1);
    expect(inserts[0].author_display_name).toBe('Dr. Rivera');
    // The existing insert must be intact.
    expect(inserts[0].program_id).toBe('p1');
    expect(inserts[0].user_id).toBe('u1');
    expect(inserts[0].title).toBe('Great APD');
  });

  it('degrades to null when the profile read returns an error, without throwing', async () => {
    supabaseMock.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });

    const inserts = [];
    supabaseMock.from
      .mockReturnValueOnce(
        builder({ data: null, error: { message: 'PGRST116: no rows' } })
      )
      .mockReturnValueOnce(
        builder({ data: { id: 'n1' }, error: null }, { onInsert: (p) => inserts.push(p) })
      );

    const { createProgramNote } = await import('@/api/programs');
    const result = await createProgramNote('p1', NOTE);

    expect(inserts[0].author_display_name).toBeNull();
    expect(result).toEqual({ id: 'n1' });
  });

  it('degrades to null when the profile read throws, without throwing', async () => {
    supabaseMock.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });

    const inserts = [];
    supabaseMock.from
      .mockReturnValueOnce({
        select: () => {
          throw new Error('network down');
        },
      })
      .mockReturnValueOnce(
        builder({ data: { id: 'n1' }, error: null }, { onInsert: (p) => inserts.push(p) })
      );

    const { createProgramNote } = await import('@/api/programs');
    const result = await createProgramNote('p1', NOTE);

    expect(inserts[0].author_display_name).toBeNull();
    expect(result).toEqual({ id: 'n1' });
  });

  it('does not persist a name on an anonymous note', async () => {
    supabaseMock.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });

    const inserts = [];
    // Only one from() call: the profile is not even read for an anonymous note.
    supabaseMock.from.mockReturnValueOnce(
      builder({ data: { id: 'n1' }, error: null }, { onInsert: (p) => inserts.push(p) })
    );

    const { createProgramNote } = await import('@/api/programs');
    await createProgramNote('p1', { ...NOTE, is_anonymous: true });

    expect(supabaseMock.from).toHaveBeenCalledTimes(1);
    expect(supabaseMock.from).toHaveBeenCalledWith('program_notes');
    expect(inserts[0].author_display_name).toBeNull();
  });

  it('still throws when there is no signed-in user', async () => {
    supabaseMock.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

    const { createProgramNote } = await import('@/api/programs');
    await expect(createProgramNote('p1', NOTE)).rejects.toThrow(/logged in/i);
  });
});
