import { supabase } from './supabaseClient';
import { normalizeProgramCounts, sanitizeIlikeTerm } from '@/lib/programSearch';

/**
 * Programs API - Community-driven program intelligence
 */

// --- Programs ---

/**
 * Build filters for community programs list.
 * Maps UI-friendly keys (verifiedOnly, search) to Supabase query options.
 */
export function buildProgramFetchOptions(filters = {}) {
  const options = {
    specialty: filters.specialty && filters.specialty !== 'all' ? filters.specialty : undefined,
    program_type:
      filters.program_type && filters.program_type !== 'all' ? filters.program_type : undefined,
    state: filters.state && filters.state !== 'all' ? filters.state : undefined,
    limit: filters.limit || 50,
  };

  if (filters.verified !== undefined) {
    options.verified = filters.verified;
  } else if (filters.verifiedOnly) {
    options.verified = true;
  }

  if (filters.search) {
    options.search = sanitizeIlikeTerm(filters.search);
  }

  return options;
}

export async function fetchPrograms(filters = {}) {
  const opts = buildProgramFetchOptions(filters);

  let query = supabase
    .from('programs')
    .select(
      `
      *,
      program_notes(count),
      scam_reports(count)
    `
    )
    .order('created_at', { ascending: false });

  if (opts.specialty) {
    query = query.contains('specialty', [opts.specialty]);
  }
  if (opts.program_type) {
    query = query.eq('program_type', opts.program_type);
  }
  if (opts.state) {
    query = query.eq('state', opts.state);
  }
  if (opts.verified !== undefined) {
    query = query.eq('verified', opts.verified);
  }
  if (opts.search) {
    query = query.or(`name.ilike.%${opts.search}%,institution.ilike.%${opts.search}%`);
  }

  const { data, error } = await query.limit(opts.limit || 50);
  if (error) throw error;
  return (data || []).map(normalizeProgramCounts);
}

export async function fetchProgramById(id) {
  const { data, error } = await supabase
    .from('programs')
    .select(
      `
      *,
      program_notes (
        *,
        user:auth.users(email, user_metadata)
      ),
      scam_reports (
        *,
        user:auth.users(email, user_metadata)
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return normalizeProgramCounts(data);
}

export async function createProgram(program) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  const { data, error } = await supabase
    .from('programs')
    .insert({
      ...program,
      submitted_by: user.id,
      verified: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgram(id, updates) {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Program Notes ---

export async function fetchProgramNotes(programId) {
  const { data, error } = await supabase
    .from('program_notes')
    .select(
      `
      *,
      user:auth.users(email, user_metadata)
    `
    )
    .eq('program_id', programId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProgramNote(programId, note) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  const { data, error } = await supabase
    .from('program_notes')
    .insert({
      program_id: programId,
      user_id: user.id,
      ...note,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function voteNoteHelpful(noteId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  const { data, error } = await supabase.rpc('vote_note_helpful', {
    note_id: noteId,
    voter_id: user.id,
  });

  if (error) throw error;
  return data;
}

// --- Scam Reports ---

export async function fetchScamReports(programId = null) {
  let query = supabase
    .from('scam_reports')
    .select(
      `
      *,
      user:auth.users(email, user_metadata)
    `
    )
    .order('created_at', { ascending: false });

  if (programId) {
    query = query.eq('program_id', programId);
  }

  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data || [];
}

export async function createScamReport(report) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  const { data, error } = await supabase
    .from('scam_reports')
    .insert({
      ...report,
      reporter_id: user.id,
      is_anonymous: true,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScamReportStatus(id, status, moderatorNotes = '') {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Must be logged in');

  const { data: profile } = await supabase
    .from('user_reputation')
    .select('verified_contributor')
    .eq('user_id', user.id)
    .single();

  if (!profile?.verified_contributor) {
    throw new Error('Insufficient permissions');
  }

  const { data, error } = await supabase
    .from('scam_reports')
    .update({ status, moderator_notes: moderatorNotes })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- User Reputation ---

export async function fetchUserReputation(userId) {
  const { data, error } = await supabase
    .from('user_reputation')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || { score: 0, verified_contributor: false };
}

export async function incrementReputation(userId, points) {
  const { data, error } = await supabase.rpc('increment_reputation', {
    target_user_id: userId,
    points,
  });

  if (error) throw error;
  return data;
}
