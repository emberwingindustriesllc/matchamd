import { supabase } from './supabaseClient';
import { normalizeProgramCounts, sanitizeIlikeTerm } from '@/lib/programSearch';

/**
 * Programs API - Community-driven program intelligence
 */

const SPECIALTIES = [
  'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Surgery',
  'Emergency Medicine', 'Psychiatry', 'OB/GYN', 'Neurology',
  'Radiology', 'Anesthesiology', 'Pathology', 'Dermatology',
  'Radiation Oncology', 'Thoracic Surgery', 'Urology', 'ENT',
  'Medical Genetics', 'Cardiology', 'Gastroenterology', 'Nephrology',
  'Pulmonology', 'Endocrinology', 'Hematology/Oncology', 'Infectious Disease',
  'Rheumatology', 'Allergy/Immunology',
  // Pediatric Subspecialties
  'Pediatric Hematology-Oncology', 'Pediatric Cardiology', 'Pediatric Gastroenterology',
  'Pediatric Emergency Medicine', 'Pediatric Critical Care', 'Pediatric Endocrinology',
  'Pediatric Nephrology', 'Pediatric Pulmonology', 'Pediatric Neonatology',
  // OB/GYN Subspecialties
  'Urogynecology', 'Maternal-Fetal Medicine', 'Gynecologic Oncology', 'Reproductive Endocrinology',
  'Other',
];

/**
 * Build filters for community programs list.
 * Maps UI-friendly keys (verifiedOnly, search) to Supabase query options.
 */
export function buildProgramFetchOptions(filters = {}) {
  const options = {
    specialty: filters.specialty && filters.specialty !== 'all' ? filters.specialty : undefined,
    specialties:
      Array.isArray(filters.specialties) && filters.specialties.length > 0
        ? filters.specialties.filter((s) => s && s !== 'all')
        : undefined,
    program_type:
      filters.program_type && filters.program_type !== 'all' ? filters.program_type : undefined,
    state: filters.state && filters.state !== 'all' ? filters.state : undefined,
    states:
      Array.isArray(filters.states) && filters.states.length > 0
        ? filters.states.filter((s) => s && s !== 'all')
        : undefined,
    limit: filters.limit || 50,
    page: filters.page || 1,
    pageSize: filters.pageSize || 50,
    visa_j1: filters.visa_j1,
    visa_h1b: filters.visa_h1b,
    accepts_img: filters.accepts_img,
    is_acgme_accredited: filters.is_acgme_accredited,
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
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (opts.specialties && opts.specialties.length > 0) {
    const formattedSpecs = opts.specialties.map(s => `"${s}"`).join(',');
    query = query.or(`specialty.ov.{${formattedSpecs}}`);
  } else if (opts.specialty) {
    const specLower = opts.specialty.toLowerCase();
    if (specLower.includes('pediatric hematology') || specLower.includes('peds hem')) {
      query = query.or('specialty.ilike.%Pediatric Hematology%,name.ilike.%Pediatric Hematology%,name.ilike.%Pediatric Oncology%');
    } else if (specLower.includes('pediatric cardiology')) {
      query = query.or('specialty.ilike.%Pediatric Cardiology%,name.ilike.%Pediatric Cardiology%');
    } else if (specLower.includes('pediatric gastroenterology')) {
      query = query.or('specialty.ilike.%Pediatric Gastroenterology%,name.ilike.%Pediatric Gastroenterology%');
    } else if (specLower.includes('urogynecology')) {
      query = query.or('specialty.ilike.%Urogynecology%,name.ilike.%Urogynecology%');
    } else {
      query = query.contains('specialty', [opts.specialty]);
    }
  }

  if (opts.program_type) {
    query = query.eq('program_type', opts.program_type);
  }

  if (opts.states && opts.states.length > 0) {
    query = query.in('state', opts.states);
  } else if (opts.state) {
    query = query.eq('state', opts.state);
  }

  if (opts.verified !== undefined) {
    query = query.eq('verified', opts.verified);
  }
  if (opts.visa_j1) {
    query = query.eq('visa_j1', true);
  }
  if (opts.visa_h1b) {
    query = query.eq('visa_h1b', true);
  }
  if (opts.accepts_img) {
    query = query.eq('accepts_img', true);
  }
  if (opts.is_acgme_accredited) {
    query = query.eq('is_acgme_accredited', true);
  }

  if (opts.search) {
    const lowercaseSearch = opts.search.toLowerCase().trim();
    const matchedSpecs = SPECIALTIES.filter(spec => {
      const specLower = spec.toLowerCase();
      return specLower.includes(lowercaseSearch) || lowercaseSearch.includes(specLower);
    });

    const keywords = opts.search.trim().split(/\s+/).filter(Boolean);
    keywords.forEach(kw => {
      const kwLower = kw.toLowerCase();
      SPECIALTIES.forEach(spec => {
        const specLower = spec.toLowerCase();
        if (specLower.includes(kwLower) && !matchedSpecs.includes(spec)) {
          matchedSpecs.push(spec);
        }
      });
    });

    let specialtyFilter = '';
    if (matchedSpecs.length > 0) {
      const formattedSpecs = matchedSpecs.map(s => `"${s}"`).join(',');
      specialtyFilter = `,specialty.ov.{${formattedSpecs}}`;
    }

    keywords.forEach(kw => {
      query = query.or(`name.ilike.%${kw}%,institution.ilike.%${kw}%,city.ilike.%${kw}%,state.ilike.%${kw}%${specialtyFilter}`);
    });
  }

  const page = opts.page || 1;
  const pageSize = opts.pageSize || 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;
  const normalized = (data || []).map(normalizeProgramCounts);
  return { data: normalized, totalCount: count || normalized.length };
}

// --- Saved Searches API ---

export async function fetchSavedSearches() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const local = localStorage.getItem('matchamd_saved_searches');
    return local ? JSON.parse(local) : [];
  }

  const { data, error } = await supabase
    .from('user_saved_searches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase saved searches table not reachable, using localStorage:', error.message);
    const local = localStorage.getItem('matchamd_saved_searches');
    return local ? JSON.parse(local) : [];
  }
  return data;
}

export async function saveSearch(name, filters) {
  const searchObj = { id: `search-${Date.now()}`, name, filters, created_at: new Date().toISOString() };
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const local = localStorage.getItem('matchamd_saved_searches');
    const existing = local ? JSON.parse(local) : [];
    const updated = [searchObj, ...existing];
    localStorage.setItem('matchamd_saved_searches', JSON.stringify(updated));
    return searchObj;
  }

  const { data, error } = await supabase
    .from('user_saved_searches')
    .insert({ user_id: user.id, name, filters })
    .select()
    .single();

  if (error) {
    console.warn('Falling back to local storage for saved search:', error.message);
    const local = localStorage.getItem('matchamd_saved_searches');
    const existing = local ? JSON.parse(local) : [];
    const updated = [searchObj, ...existing];
    localStorage.setItem('matchamd_saved_searches', JSON.stringify(updated));
    return searchObj;
  }
  return data;
}

export async function deleteSavedSearch(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || id.startsWith('search-')) {
    const local = localStorage.getItem('matchamd_saved_searches');
    if (local) {
      const existing = JSON.parse(local);
      const updated = existing.filter(s => s.id !== id);
      localStorage.setItem('matchamd_saved_searches', JSON.stringify(updated));
    }
    return;
  }

  await supabase.from('user_saved_searches').delete().eq('id', id);
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
