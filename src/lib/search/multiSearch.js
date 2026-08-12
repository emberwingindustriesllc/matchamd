import { supabase } from '@/api/supabaseClient';
import { parseLocationLabel } from './locationTypeahead';

/**
 * Default state when the page loads — default program types on,
 * no specialties or locations selected, all boolean filters
 * set to null (meaning "don't filter").
 */
export const defaultSearchState = {
  programTypes: ['residency', 'fellowship', 'observership', 'research', 'elective'],
  specialties: [],
  locations: [],
  searchQuery: '',
  filters: {
    acgmeAccredited: null,     // null = don't filter, true = only accredited, false = only non-accredited
    ecfmgPathway: null,
    j1Visa: null,
    h1bVisa: null,
    erasParticipating: null,
    nrmpParticipating: null,
    verifiedOnly: null
  },
  pagination: {
    limit: 20,
    offset: 0
  }
};

/**
 * Convert UI chip state into parameters for search_programs() RPC.
 */
export function buildSearchParams(state) {
  const p_program_types = state.programTypes?.length > 0 ? state.programTypes : null;
  const p_specialties = state.specialties?.length > 0 ? state.specialties : [];

  const cities = [];
  const states = [];
  for (const loc of (state.locations || [])) {
    const parsed = parseLocationLabel(loc);
    if (parsed.city) cities.push(parsed.city);
    if (parsed.state) states.push(parsed.state);
  }

  const {
    acgmeAccredited,
    ecfmgPathway,
    j1Visa,
    h1bVisa,
    erasParticipating,
    nrmpParticipating,
    verifiedOnly
  } = state.filters || {};

  return {
    p_program_types,
    p_specialties,
    p_cities: cities.length > 0 ? cities : [],
    p_states: states.length > 0 ? states : [],
    p_acgme_accredited: acgmeAccredited ?? null,
    p_ecfmg_pathway: ecfmgPathway ?? null,
    p_j1_visa: j1Visa ?? null,
    p_h1b_visa: h1bVisa ?? null,
    p_eras_participating: erasParticipating ?? null,
    p_nrmp_participating: nrmpParticipating ?? null,
    p_verified_only: verifiedOnly ?? null,
    p_search: state.searchQuery || null,
    p_limit: state.pagination?.limit || 20,
    p_offset: state.pagination?.offset || 0
  };
}

/**
 * Call search_programs() RPC.
 */
export async function multiSearch(state) {
  const params = buildSearchParams(state);
  const { data, error } = await supabase.rpc('search_programs', params);

  if (error) {
    console.error('search_programs() failed:', error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

export function resetPagination(state) {
  return {
    ...state,
    pagination: { limit: state.pagination?.limit || 20, offset: 0 }
  };
}

export function nextPage(state) {
  return {
    ...state,
    pagination: {
      limit: state.pagination?.limit || 20,
      offset: (state.pagination?.offset || 0) + (state.pagination?.limit || 20)
    }
  };
}
