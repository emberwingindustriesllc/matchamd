/**
 * Search query parser — tokenizes user queries and identifies
 * program type terms and specialty aliases.
 */

// ─── Program type term recognition ──────────────────────────────────────────

const PROGRAM_TYPE_TERMS = new Map([
  ['residency', 'residency'],
  ['residencies', 'residency'],
  ['res', 'residency'],
  ['fellowship', 'fellowship'],
  ['fellowships', 'fellowship'],
  ['fellow', 'fellowship'],
  ['fellows', 'fellowship'],
  ['observership', 'observership'],
  ['observerships', 'observership'],
  ['research', 'research'],
  ['elective', 'elective'],
  ['electives', 'elective'],
  ['medical school', 'medical_school'],
  ['medical schools', 'medical_school'],
  ['med school', 'medical_school'],
  ['med schools', 'medical_school'],
  ['medschool', 'medical_school'],
  ['medschools', 'medical_school'],
]);

// Sort by length descending so longer matches (e.g. "medical school") 
// are tried before shorter ones (e.g. "res")
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
 *    650 - Program name contains free-text search
 *    600 - Program name ILIKE with query
 *    550 - Institution contains free-text
 *    500 - Institution ILIKE with query
 *    450 - Specialty array text contains search
 *    400 - City match
 *    350 - State match
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
  
  // ── 950: Exact specialty match via alias (normalize the program specialty and compare)
  if (parsed.specialty) {
    // Check if any program specialty matches the parsed specialty via alias
    const aliasCanon = aliasMap ? aliasMap[parsed.specialty.toLowerCase()] : null;
    if (aliasCanon) {
      for (const progSpec of (program.specialty || [])) {
        if (progSpec.toLowerCase() === aliasCanon.toLowerCase()) {
          score += 950;
          break;
        }
      }
    }
  }
  
  // ── 900: Exact program name match ──
  for (const token of parsed.tokens) {
    if (token.length >= 3 && normalizedName === token) {
      score += 900;
      break;
    }
  }
  
  // ── 850: Program name contains the exact specialty alias ──
  if (parsed.specialty) {
    for (const progSpec of (program.specialty || [])) {
      if (normalizedName.includes(progSpec.toLowerCase())) {
        score += 850;
        break;
      }
    }
  }
  
  // ── 800: Institution exact match ──
  for (const token of parsed.tokens) {
    if (token.length >= 3 && normalizedInstitution === token) {
      score += 800;
      break;
    }
  }
  
  // ── 750: Specialty alias match in program name ──
  if (parsed.specialty) {
    for (const progSpec of (program.specialty || [])) {
      if (normalizedName.includes(progSpec.toLowerCase())) {
        score += 750;
        break;
      }
    }
  }
  
  // ── 700: Specialty alias match (program specialty matches alias) ──
  if (parsed.specialty) {
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
  
  // ── 650: Program name contains free-text search ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 3 && normalizedName.includes(token)) {
      score += 650;
      break;
    }
  }
  
  // ── 600: Program name ILIKE with query ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 3 && normalizedName.includes(token)) {
      score += 600;
      break;
    }
  }
  
  // ── 550: Institution contains free-text search ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 3 && normalizedInstitution.includes(token)) {
      score += 550;
      break;
    }
  }
  
  // ── 500: Institution ILIKE with query ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 3 && normalizedInstitution.includes(token)) {
      score += 500;
      break;
    }
  }
  
  // ── 450: Specialty array text contains search ──
  if (parsed.freeTextTokens.length > 0) {
    for (const token of parsed.freeTextTokens) {
      if (token.length >= 3 && programSpecialties.includes(token)) {
        score += 450;
        break;
      }
    }
  }
  
  // ── 400: City match ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 2 && (normalizedCity.includes(token) || normalizedState.includes(token))) {
      score += 400;
      break;
    }
  }
  
  // ── 350: State match ──
  for (const token of parsed.freeTextTokens) {
    if (token.length >= 2 && normalizedState.includes(token)) {
      score += 350;
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
  
  // ── 100: Generic token match in any text field ──
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
};
