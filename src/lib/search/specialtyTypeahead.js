import { supabase } from '@/api/supabaseClient';

let specialtyCache = null;

/**
 * Load the full specialty list from the search_specialties view.
 * Call once on page load / component mount.
 */
export async function loadSpecialties() {
  if (specialtyCache) return specialtyCache;

  const { data, error } = await supabase
    .from('search_specialties')
    .select('specialty, name, program_count')
    .order('program_count', { ascending: false });

  if (error) {
    console.error('Failed to load specialties:', error);
    return [];
  }

  specialtyCache = data || [];
  return specialtyCache;
}

/**
 * Filter cached specialties by user query.
 */
export function filterSpecialties(query, limit = 15) {
  if (!specialtyCache) return [];
  if (!query || query.trim() === '') {
    return specialtyCache.slice(0, limit);
  }

  const q = query.toLowerCase().trim();
  const matches = specialtyCache.filter(item =>
    (item.specialty || item.name || '').toLowerCase().includes(q)
  );
  return matches.slice(0, limit);
}

export function addSpecialtyChip(state, specialtyName) {
  if (!specialtyName || state.specialties.includes(specialtyName)) return state;
  return {
    ...state,
    specialties: [...state.specialties, specialtyName]
  };
}

export function removeSpecialtyChip(state, specialtyName) {
  return {
    ...state,
    specialties: state.specialties.filter(s => s !== specialtyName)
  };
}
