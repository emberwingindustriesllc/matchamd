import { supabase } from '@/api/supabaseClient';

let specialtyCache = null;
let aliasCache = null;

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
 * Load specialty aliases from the specialty_aliases table.
 * Used for typeahead matching.
 */
export async function loadSpecialtyAliases() {
  if (aliasCache) return aliasCache;

  const { data, error } = await supabase
    .from('specialty_aliases')
    .select('canonical_specialty, alias, normalized_alias')
    .order('canonical_specialty');

  if (error) {
    console.error('Failed to load specialty aliases:', error);
    aliasCache = [];
    return aliasCache;
  }

  aliasCache = data || [];
  return aliasCache;
}

/**
 * Build a normalized alias map from the alias cache.
 * Map of normalized_alias → canonical_specialty
 */
export function buildAliasMap(aliases) {
  const map = {};
  for (const row of aliases) {
    if (row.normalized_alias) {
      map[row.normalized_alias] = row.canonical_specialty;
    }
  }
  return map;
}

/**
 * Normalize a query string for matching.
 * Lowercase, trim, normalize /, -, & to spaces.
 */
export function normalizeQuery(q) {
  if (!q || typeof q !== 'string') return '';
  return q
    .toLowerCase()
    .trim()
    .replace(/[\/\-&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a query matches a specialty via alias.
 * Returns the canonical specialty name if matched, null otherwise.
 */
export function matchAlias(query, aliasMap) {
  if (!query || !aliasMap) return null;
  const normalized = normalizeQuery(query);
  return aliasMap[normalized] || null;
}

/**
 * Filter cached specialties by user query — enhanced with alias matching.
 * 
 * @param {string} query - user's search query
 * @param {number} limit - max results to return
 * @returns {Array} matching specialty items
 */
export function filterSpecialties(query, limit = 15) {
  if (!specialtyCache) return [];

  if (!query || query.trim() === '') {
    return specialtyCache.slice(0, limit);
  }

  const normalized = normalizeQuery(query);
  
  // 1. Try alias match first (highest priority)
  if (aliasCache) {
    const aliasMap = buildAliasMap(aliasCache);
    const canonical = aliasMap[normalized];
    if (canonical) {
      // Find the specialty item with this canonical name
      const match = specialtyCache.find(
        item => (item.specialty || item.name || '').toLowerCase() === canonical.toLowerCase()
      );
      if (match) {
        return [match];
      }
    }
  }

  // 2. Try fuzzy/partial matching on specialty names
  const matches = specialtyCache.filter(item => {
    const name = (item.specialty || item.name || '').toLowerCase();
    
    // Direct substring match
    if (name.includes(normalized)) return true;
    
    // Token-based match: every query token must appear in the name
    const queryTokens = normalized.split(/\s+/).filter(t => t.length > 0);
    if (queryTokens.length === 0) return false;
    
    return queryTokens.every(token => {
      if (token.length < 2) return true; // skip very short tokens
      return name.includes(token);
    });
    
    // Also check if the name can be tokenized and matches query tokens
    const nameTokens = name.replace(/[&\/\-]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    if (nameTokens.length > 0 && queryTokens.length > 0) {
      // Check for common abbreviation patterns
      // e.g. "obgyn" should match "obstetrics and gynecology"
      const compactQuery = normalized.replace(/\s/g, '');
      const compactName = name.replace(/\s/g, '');
      if (compactName.includes(compactQuery) || compactQuery.includes(compactName)) {
        return true;
      }
      
      // Check if query is a prefix of any name token
      return queryTokens.some(qt => 
        nameTokens.some(nt => nt.startsWith(qt) || qt.startsWith(nt))
      );
    }
    
    return false;
  });

  // Sort: exact or close matches first
  matches.sort((a, b) => {
    const nameA = (a.specialty || a.name || '').toLowerCase();
    const nameB = (b.specialty || b.name || '').toLowerCase();
    
    // Exact match gets highest priority
    if (nameA === normalized) return -1;
    if (nameB === normalized) return 1;
    
    // Shorter name (more likely to be the canonical) gets priority
    return nameA.length - nameB.length;
  });

  return matches.slice(0, limit);
}

/**
 * Add a specialty chip to search state.
 */
export function addSpecialtyChip(state, specialtyName) {
  if (!specialtyName || state.specialties.includes(specialtyName)) return state;
  return {
    ...state,
    specialties: [...state.specialties, specialtyName]
  };
}

/**
 * Remove a specialty chip from search state.
 */
export function removeSpecialtyChip(state, specialtyName) {
  return {
    ...state,
    specialties: state.specialties.filter(s => s !== specialtyName)
  };
}
