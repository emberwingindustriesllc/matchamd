/**
 * Query Parser for MatchAMD search
 * 
 * Tokenizes user search queries and identifies:
 * - Program type terms (residency, fellowship, etc.)
 * - Specialty aliases (OB/GYN → Obstetrics and Gynecology)
 * - Free-text tokens for fuzzy matching
 * 
 * This is a pure function module — no side effects, no imports.
 * Designed to work both client-side (typeahead) and server-side (RPC).
 */

// ─── Program type term recognition ──────────────────────────────────────────

const PROGRAM_TYPE_TERMS = new Map([
  // residency variants
  ['residency', 'residency'],
  ['residencies', 'residency'],
  ['res', 'residency'],
  // fellowship variants
  ['fellowship', 'fellowship'],
  ['fellowships', 'fellowship'],
  ['fellow', 'fellowship'],
  ['fellows', 'fellowship'],
  // observership variants
  ['observership', 'observership'],
  ['observerships', 'observership'],
  ['observerships', 'observership'],
  // research
  ['research', 'research'],
  [' researches', 'research'],
  // elective
  ['elective', 'elective'],
  ['electives', 'elective'],
  // medical school
  ['medical school', 'medical_school'],
  ['medical schools', 'medical_school'],
  ['med school', 'medical_school'],
  ['med schools', 'medical_school'],
  ['medschool', 'medical_school'],
  ['medschools', 'medical_school'],
]);

// Sort by length descending so longer matches (e.g. "medical school") 
// are tried before shorter ones (e.g. "med")
const SORTED_PROGRAM_TYPE_PATTERNS = [...PROGRAM_TYPE_TERMS.entries()]
  .sort((a, b) => b[0].length - a[0].length);

// ─── Normalization ──────────────────────────────────────────────────────────

/**
 * Normalize a query string for consistent matching.
 * - lowercase
 * - collapse whitespace
 * - normalize punctuation: / - & → space
 * - strip leading/trailing whitespace
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
 * Normalize an alias for storage/comparison.
 * Same normalization as normalizeQuery but also collapses
 * repeated spaces and strips punctuation at boundaries.
 */
export function normalizeAlias(alias) {
  if (!alias || typeof alias !== 'string') return '';
  return normalizeQuery(alias);
}

// ─── Tokenization ───────────────────────────────────────────────────────────

/**
 * Split a normalized query into individual tokens.
 * E.g. "OB/GYN residency" → ["ob", "gyn", "residency"]
 *       "heme onc fellowship" → ["heme", "onc", "fellowship"]
 */
export function tokenizeQuery(q) {
  const normalized = normalizeQuery(q);
  if (!normalized) return [];
  return normalized.split(' ');
}

// ─── Program type extraction ─────────────────────────────────────────────────

/**
 * Check if a single token is a recognized program type term.
 * Returns the normalized program type or null.
 */
export function isProgramTypeTerm(token) {
  const normalized = token.toLowerCase().trim();
  return PROGRAM_TYPE_TERMS.get(normalized) || null;
}

/**
 * Check if a phrase (multi-word) matches a program type.
 * E.g. "medical school" → "medical_school"
 */
export function extractProgramTypeFromQuery(q) {
  const normalized = normalizeQuery(q);
  if (!normalized) return null;
  
  for (const [phrase, programType] of SORTED_PROGRAM_TYPE_PATTERNS) {
    if (normalized.includes(phrase)) {
      return programType;
    }
  }
  return null;
}

// ─── Specialty alias lookup ──────────────────────────────────────────────────

/**
 * Given a normalized alias string, return the canonical specialty.
 * This is a pure lookup — the actual aliases are stored in
 * the specialty_aliases table on the database side.
 * 
 * For client-side use (typeahead), this function checks against
 * a client-cached alias map.
 * 
 * @param {string} normalizedAlias - normalized alias string
 * @param {Object<string, string>} aliasMap - map of normalized_alias → canonical_specialty
 * @returns {string|null} canonical specialty name or null
 */
export function lookupSpecialtyAlias(normalizedAlias, aliasMap = null) {
  if (!normalizedAlias || !aliasMap) return null;
  return aliasMap[normalizedAlias] || null;
}

/**
 * Try to match a token sequence against known specialty aliases.
 * Handles multi-word aliases like "ob gyn" → "Obstetrics and Gynecology".
 * 
 * @param {string[]} tokens - array of query tokens
 * @param {Object<string, string>} aliasMap - map of normalized_alias → canonical_specialty
 * @returns {string|null} canonical specialty or null
 */
export function matchSpecialtyFromTokens(tokens, aliasMap = null) {
  if (!tokens || tokens.length === 0 || !aliasMap) return null;
  
  // Try matching from longest token sequences down to 1 token
  const maxPhraseLength = Math.min(tokens.length, 4);
  
  for (let phraseLen = maxPhraseLength; phraseLen >= 1; phraseLen--) {
    for (let i = 0; i <= tokens.length - phraseLen; i++) {
      const phrase = tokens.slice(i, i + phraseLen).join(' ');
      const canonical = aliasMap[phrase];
      if (canonical) {
        return canonical;
      }
    }
  }
  
  return null;
}

// ─── Full query parsing ──────────────────────────────────────────────────────

/**
 * Parse a user search query into structured components.
 * 
 * @param {string} query - raw user input
 * @param {Object<string, string>} [aliasMap] - optional alias map for specialty resolution
 * @returns {object} parsed query with:
 *   - raw: original query
 *   - normalized: normalized query string
 *   - tokens: array of individual tokens
 *   - programType: inferred program type (or null)
 *   - specialty: inferred canonical specialty (or null)
 *   - freeTextTokens: tokens remaining after stripping program type terms
 *   - hasExplicitFilters: whether the query contains explicit structured terms
 */
export function parseSearchQuery(query, aliasMap = null) {
  const raw = query || '';
  const normalized = normalizeQuery(raw);
  const tokens = tokenizeQuery(raw);
  
  // Extract program type from the full query
  const programType = extractProgramTypeFromQuery(raw);
  
  // Find specialty from tokens using alias map
  const specialty = matchSpecialtyFromTokens(tokens, aliasMap);
  
  // Compute free-text tokens (all tokens minus recognized program type terms)
  const freeTextTokens = tokens.filter(t => !isProgramTypeTerm(t));
  
  return {
    raw,
    normalized,
    tokens,
    programType,
    specialty,
    freeTextTokens,
    hasExplicitFilters: programType !== null || specialty !== null
  };
}

// ─── Score calculation helpers ───────────────────────────────────────────────

/**
 * Calculate a relevance score for a program given a parsed query.
 * Higher scores = better match.
 * 
 * Scoring tiers (higher = better):
 *   1000 - Exact canonical specialty match
 *    900 - Exact program name match (normalized)
 *    800 - Institution exact match
 *    700 - Specialty alias match
 *    600 - Program name partial match (contains query token)
 *    500 - Institution partial match
 *    400 - City/state match
 *    300 - Description match
 *    100 - Generic token match in any text field
 * 
 * @param {object} program - program row from database
 * @param {object} parsed - result of parseSearchQuery()
 * @param {object<string, string>} aliasMap - alias map for specialty resolution
 * @returns {number} relevance score (0 = no match)
 */
export function calculateRelevanceScore(program, parsed, aliasMap = null) {
  if (!parsed || !parsed.tokens || parsed.tokens.length === 0) {
    return 0;
  }
  
  let score = 0;
  const normalizedName = (program.name || '').toLowerCase();
  const normalizedInstitution = (program.institution || '').toLowerCase();
  const normalizedCity = (program.city || '').toLowerCase();
  const normalizedState = (program.state || '').toLowerCase();
  const normalizedDescription = (program.description || '').toLowerCase();
  
  // Build normalized specialty string from the array
  const programSpecialties = (program.specialty || [])
    .map(s => s.toLowerCase())
    .join(' ');
  
  // Get canonical specialty for this program (first element of array)
  const programCanonicalSpecialty = (program.specialty && program.specialty[0]) 
    ? program.specialty[0].toLowerCase() 
    : '';
  
  // ── 1000: Exact canonical specialty match ──
  if (parsed.specialty && programCanonicalSpecialty === parsed.specialty.toLowerCase()) {
    score += 1000;
  }
  
  // ── 900: Exact program name match ──
  for (const token of parsed.tokens) {
    if (token.length >= 3 && normalizedName === token) {
      score += 900;
      break;
    }
  }
  
  // ── 800: Institution exact match ──
  for (const token of parsed.tokens) {
    if (token.length >= 3 && normalizedInstitution === token) {
      score += 800;
      break;
    }
  }
  
  // ── 700: Specialty alias match ──
  if (parsed.specialty) {
    // Check if any program specialty matches the parsed specialty via alias
    const aliasCanon = aliasMap ? aliasMap[parsed.specialty.toLowerCase()] : null;
    if (aliasCanon) {
      for (const progSpec of (program.specialty || [])) {
        if (progSpec.toLowerCase() === aliasCanon.toLowerCase()) {
          score += 700;
          break;
        }
      }
    }
  }
  
  // ── 600: Program name partial match ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 3 && normalizedName.includes(token)) {
      score += 600;
      break;
    }
  }
  
  // ── 500: Institution partial match ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 3 && normalizedInstitution.includes(token)) {
      score += 500;
      break;
    }
  }
  
  // ── 400: City/state match ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 2 && (normalizedCity.includes(token) || normalizedState.includes(token))) {
      score += 400;
      break;
    }
  }
  
  // ── 300: Description match ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 3 && normalizedDescription.includes(token)) {
      score += 300;
      break;
    }
  }
  
  // ── 100: Generic token match in any field ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 2) {
      const allText = [normalizedName, normalizedInstitution, normalizedCity, normalizedState, normalizedDescription, programSpecialties]
        .join(' ');
      if (allText.includes(token)) {
        score += 100;
        break;
      }
    }
  }
  
  return score;
}

// ─── Alias map builder ───────────────────────────────────────────────────────

/**
 * Build a normalized alias map from an array of alias rows.
 * Each row should have: canonical_specialty, alias, normalized_alias
 * 
 * @param {Array<{canonical_specialty: string, alias: string, normalized_alias: string}>} aliasRows
 * @returns {Object<string, string>} map of normalized_alias → canonical_specialty
 */
export function buildAliasMap(aliasRows) {
  const map = {};
  for (const row of aliasRows) {
    if (row.normalized_alias) {
      map[row.normalized_alias] = row.canonical_specialty;
    }
  }
  return map;
}

// ─── Default alias map (client-side fallback) ────────────────────────────────

/**
 * A curated set of the most common aliases for client-side typeahead.
 * This is a subset — the full alias table lives in the database.
 * The database mapping is authoritative; this is for fast client-side suggestions.
 */
export const DEFAULT_ALIAS_MAP = {
  // OB/GYN
  'obgyn': 'Obstetrics and Gynecology',
  'ob gyn': 'Obstetrics and Gynecology',
  'ob-gyn': 'Obstetrics and Gynecology',
  'ob/gyn': 'Obstetrics and Gynecology',
  'ob gyne': 'Obstetrics and Gynecology',
  'obstetrics and gynecology': 'Obstetrics and Gynecology',
  'obstetrics gynecology': 'Obstetrics and Gynecology',
  'obstetrics/gynecology': 'Obstetrics and Gynecology',
  'obstetrics & gynecology': 'Obstetrics and Gynecology',
  'gynecology': 'Obstetrics and Gynecology',
  'obstetrics': 'Obstetrics and Gynecology',
  
  // Internal Medicine
  'internal medicine': 'Internal Medicine',
  'internal med': 'Internal Medicine',
  'im': 'Internal Medicine',
  'internal medicine residency': 'Internal Medicine',
  
  // Pediatrics
  'pediatrics': 'Pediatrics',
  'peds': 'Pediatrics',
  'pediatric': 'Pediatrics',
  'pediatric medicine': 'Pediatrics',
  
  // Family Medicine
  'family medicine': 'Family Medicine',
  'family med': 'Family Medicine',
  'fm': 'Family Medicine',
  'family practice': 'Family Medicine',
  
  // Emergency Medicine
  'emergency medicine': 'Emergency Medicine',
  'em': 'Emergency Medicine',
  'er': 'Emergency Medicine',
  'emergency med': 'Emergency Medicine',
  
  // Surgery
  'surgery': 'Surgery',
  'general surgery': 'Surgery',
  'gen surg': 'Surgery',
  'gs': 'Surgery',
  
  // Psychiatry
  'psychiatry': 'Psychiatry',
  'psych': 'Psychiatry',
  'psychiatric medicine': 'Psychiatry',
  
  // Neurology
  'neurology': 'Neurology',
  'neuro': 'Neurology',
  
  // Anesthesiology
  'anesthesiology': 'Anesthesiology',
  'anesthesia': 'Anesthesiology',
  'anes': 'Anesthesiology',
  
  // Radiology
  'radiology': 'Radiology',
  'diagnostic radiology': 'Radiology',
  'dr': 'Radiology',
  
  // Pathology
  'pathology': 'Pathology',
  'path': 'Pathology',
  
  // Dermatology
  'dermatology': 'Dermatology',
  'derm': 'Dermatology',
  
  // Orthopaedic Surgery
  'orthopaedic surgery': 'Orthopaedic Surgery',
  'orthopedic surgery': 'Orthopaedic Surgery',
  'ortho': 'Orthopaedic Surgery',
  'orthopedics': 'Orthopaedic Surgery',
  
  // Heme/Onc
  'hematology oncology': 'Hematology/Oncology',
  'hematology/oncology': 'Hematology/Oncology',
  'heme onc': 'Hematology/Oncology',
  'heme-onc': 'Hematology/Oncology',
  'haematology oncology': 'Hematology/Oncology',
  'hematology and oncology': 'Hematology/Oncology',
  
  // Cardiology
  'cardiology': 'Cardiology',
  'cardiovascular disease': 'Cardiology',
  
  // Gastroenterology
  'gastroenterology': 'Gastroenterology',
  'gi': 'Gastroenterology',
  
  // Pulmonology
  'pulmonology': 'Pulmonology',
  'pulmonary': 'Pulmonology',
  'pulmonary critical care': 'Pulmonology',
  'pulmonary/critical care': 'Pulmonology',
  
  // Nephrology
  'nephrology': 'Nephrology',
  
  // Endocrinology
  'endocrinology': 'Endocrinology',
  'diabetes': 'Endocrinology',
  
  // Infectious Disease
  'infectious disease': 'Infectious Disease',
  'id': 'Infectious Disease',
  
  // Rheumatology
  'rheumatology': 'Rheumatology',
  
  // Allergy/Immunology
  'allergy immunology': 'Allergy/Immunology',
  'allergy and immunology': 'Allergy/Immunology',
  'allergy': 'Allergy/Immunology',
  'immunology': 'Allergy/Immunology',
  'allergy/immunology': 'Allergy/Immunology',
  
  // Geriatric Medicine
  'geriatric medicine': 'Geriatric Medicine',
  'geriatrics': 'Geriatric Medicine',
  
  // Sleep Medicine
  'sleep medicine': 'Sleep Medicine',
  'sleep': 'Sleep Medicine',
  
  // Sports Medicine
  'sports medicine': 'Sports Medicine',
  'sports med': 'Sports Medicine',
  
  // Ophthalmology
  'ophthalmology': 'Ophthalmology',
  'eye': 'Ophthalmology',
  
  // Otolaryngology
  'otolaryngology': 'Otolaryngology',
  'ent': 'Otolaryngology',
  'ear nose throat': 'Otolaryngology',
  
  // Urology
  'urology': 'Urology',
  
  // Physical Medicine & Rehabilitation
  'physical medicine': 'Physical Medicine and Rehabilitation',
  'pm&r': 'Physical Medicine and Rehabilitation',
  'pmr': 'Physical Medicine and Rehabilitation',
  'rehabilitation medicine': 'Physical Medicine and Rehabilitation',
  
  // Radiation Oncology
  'radiation oncology': 'Radiation Oncology',
  'radiation': 'Radiation Oncology',
  
  // Medical Genetics
  'medical genetics': 'Medical Genetics',
  'genetics': 'Medical Genetics',
  
  // Child Psychiatry
  'child psychiatry': 'Child Psychiatry',
  'child psych': 'Child Psychiatry',
  
  // Addiction Psychiatry
  'addiction psychiatry': 'Addiction Psychiatry',
  'addiction': 'Addiction Psychiatry',
  
  // Hospice/Palliative
  'hospice': 'Hospice and Palliative Medicine',
  'palliative': 'Hospice and Palliative Medicine',
  'palliative care': 'Hospice and Palliative Medicine',
  
  // Vascular Surgery
  'vascular surgery': 'Vascular Surgery',
  'vascular': 'Vurgery',
  
  // Plastic Surgery
  'plastic surgery': 'Plastic Surgery',
  'plastics': 'Plastic Surgery',
  
  // Dermatopathology
  'dermatopathology': 'Dermatopathology',
  
  // Pediatric subspecialties
  'pediatric cardiology': 'Pediatric Cardiology',
  'pediatric critical care': 'Pediatric Critical Care Medicine',
  'pediatric emergency medicine': 'Pediatric Emergency Medicine',
  'pediatric gastroenterology': 'Pediatric Gastroenterology',
  'pediatric hematology oncology': 'Pediatric Hematology/Oncology',
  'pediatric nephrology': 'Pediatric Nephrology',
  'pediatric pulmonology': 'Pediatric Pulmonology',
  'pediatric rheumatology': 'Pediatric Rheumatology',
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export default {
  normalizeQuery,
  normalizeAlias,
  tokenizeQuery,
  isProgramTypeTerm,
  extractProgramTypeFromQuery,
  lookupSpecialtyAlias,
  matchSpecialtyFromTokens,
  parseSearchQuery,
  calculateRelevanceScore,
  buildAliasMap,
  DEFAULT_ALIAS_MAP,
};
