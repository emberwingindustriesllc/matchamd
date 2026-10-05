import { supabase } from '@/api/supabaseClient';
import { expandMedicalSearchTerms } from '@/lib/medicalSynonyms';

let specialtyCache = null;
let aliasCache = null;

/**
 * Load the full specialty list from the search_specialties view.
 * Call once on page load / component mount.
 */
export async function loadSpecialties() {
  if (specialtyCache) return specialtyCache;

  let data = null;
  let error = null;
  try {
    const res = await supabase
      .from('search_specialties')
      .select('specialty, name, program_count')
      .order('program_count', { ascending: false });
    data = res?.data ?? null;
    error = res?.error ?? null;
  } catch (thrown) {
    // See loadLocations(): a thrown rejection must not leave the cache null.
    error = thrown;
  }

  if (error) {
    console.error('Failed to load specialties:', error);
    // Populate the cache with the fallback list. Leaving it null makes
    // filterSpecialties() dereference null, which crashes the page into the
    // error boundary whenever the view is unreachable.
    specialtyCache = DEFAULT_SPECIALTIES;
    return specialtyCache;
  }

  specialtyCache = data && data.length > 0 ? data : DEFAULT_SPECIALTIES;
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

const DEFAULT_SPECIALTIES = [
  { specialty: 'Internal Medicine', name: 'Internal Medicine', program_count: 600 },
  { specialty: 'Family Medicine', name: 'Family Medicine', program_count: 550 },
  { specialty: 'Pediatrics', name: 'Pediatrics', program_count: 280 },
  { specialty: 'Surgery', name: 'Surgery', program_count: 260 },
  { specialty: 'Emergency Medicine', name: 'Emergency Medicine', program_count: 240 },
  { specialty: 'Psychiatry', name: 'Psychiatry', program_count: 220 },
  { specialty: 'OB/GYN', name: 'OB/GYN', program_count: 210 },
  { specialty: 'Neurology', name: 'Neurology', program_count: 170 },
  { specialty: 'Pathology', name: 'Pathology', program_count: 150 },
  { specialty: 'Radiology', name: 'Radiology', program_count: 160 },
  { specialty: 'Anesthesiology', name: 'Anesthesiology', program_count: 160 },
  { specialty: 'Pediatric Hematology-Oncology', name: 'Pediatric Hematology-Oncology', program_count: 65 },
  { specialty: 'Pediatric Cardiology', name: 'Pediatric Cardiology', program_count: 60 },
  { specialty: 'Pediatric Emergency Medicine', name: 'Pediatric Emergency Medicine', program_count: 55 },
  { specialty: 'Pediatric Critical Care', name: 'Pediatric Critical Care', program_count: 50 },
];

/**
 * Filter cached specialties by user query — enhanced with alias matching.
 * 
 * @param {string} query - user's search query
 * @param {number} limit - max results to return
 * @returns {Array} matching specialty items
 */
export function filterSpecialties(query, limit = 15) {
  const pool = (specialtyCache && specialtyCache.length > 0) ? specialtyCache : DEFAULT_SPECIALTIES;

  if (!query || query.trim() === '') {
    return pool.slice(0, limit);
  }

  const normalized = normalizeQuery(query);

  // 1. Try alias match first (highest priority)
  if (aliasCache) {
    const aliasMap = buildAliasMap(aliasCache);
    const canonical = aliasMap[normalized];
    if (canonical) {
      const match = pool.find(
        item => (item.specialty || item.name || '').toLowerCase() === canonical.toLowerCase()
      );
      if (match) {
        return [match];
      }
    }
  }

  // 2. Synonym expansion: map colloquial/abbreviated input onto the canonical
  //    specialty vocabulary ("obgyn" -> "Obstetrics and Gynecology", "peds" ->
  //    "Pediatrics") before doing any name matching.
  const synonyms = expandMedicalSearchTerms(normalized)
    .map((t) => normalizeQuery(t))
    .filter(Boolean);

  const queryTokens = normalized.split(/\s+/).filter(t => t.length > 0);
  const compactQuery = normalized.replace(/\s/g, '');

  // 3. Fuzzy/partial matching on specialty names.
  //    Every strategy must `return true` from the predicate. The previous
  //    version returned from the whole filter callback inside the token loop,
  //    which made the compact/prefix strategies unreachable dead code.
  const matches = pool.filter(item => {
    const name = (item.specialty || item.name || '').toLowerCase();
    if (!name) return false;

    if (synonyms.some(s => name.includes(s) || s.includes(name))) return true;
    if (name.includes(normalized)) return true;

    if (queryTokens.length === 0) return false;
    if (queryTokens.every(token => token.length < 2 || name.includes(token))) return true;

    // Compare in both directions so "obgyn" matches "Obstetrics and Gynecology"
    // and "Peds" matches "Pediatrics".
    const nameTokens = name.replace(/[&\/\-]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    if (nameTokens.length > 0) {
      const compactName = name.replace(/\s/g, '');
      if (compactName.includes(compactQuery) || (compactQuery.length >= 3 && compactQuery.includes(compactName))) {
        return true;
      }
      if (queryTokens.some(qt => nameTokens.some(nt => nt.startsWith(qt) || qt.startsWith(nt)))) {
        return true;
      }
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
