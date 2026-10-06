/**
 * Pure helpers for IMG program directory search, fit scoring, and sorting.
 * Kept free of React so they can be unit-tested.
 */
import { normalizeStateTerm, getRegionForState } from '@/utils/stateMap';
import { parseLocationLabel } from '@/lib/search/locationTypeahead';
import { expandMedicalSearchTerms } from '@/lib/medicalSynonyms';

export function normalizeSearchText(value = '') {
  return String(value).trim().toLowerCase();
}

/**
 * Calculate how well a residency program fits a user profile.
 */
export function calculateFitScore(prog, profile, options = {}) {
  if (!profile) {
    return { score: 50, reasons: ['No profile configured'], meetsAll: false, visaIssue: false };
  }

  let score = 100;
  const reasons = [];
  let visaIssue = false;
  let meetsAll = true;
  const currentYear = options.currentYear ?? new Date().getFullYear();

  const userNeedsVisa =
    profile.visa_status === 'none' ||
    profile.visa_status === 'J1' ||
    profile.visa_status === 'H1B';

  if (userNeedsVisa) {
    const programSponsorsJ1 = !!prog.visa_j1;
    const programSponsorsH1B = !!prog.visa_h1b;
    if (!programSponsorsJ1 && !programSponsorsH1B) {
      score -= 40;
      reasons.push('Does not sponsor J-1 or H-1B visas');
      visaIssue = true;
      meetsAll = false;
    } else if (profile.visa_status === 'H1B' && !programSponsorsH1B) {
      score -= 20;
      reasons.push('Does not sponsor H-1B (J-1 only)');
      meetsAll = false;
    } else if (profile.visa_status === 'J1' && !programSponsorsJ1 && programSponsorsH1B) {
      reasons.push('Sponsors H-1B; confirm J-1 availability');
    }
  }

  const userScore = profile.usmle_step2_score != null ? Number(profile.usmle_step2_score) : null;
  if (userScore != null && !Number.isNaN(userScore)) {
    if (prog.step2_score_min != null && userScore < prog.step2_score_min) {
      score -= 25;
      reasons.push(`Your Step 2 CK (${userScore}) is below program minimum (${prog.step2_score_min})`);
      meetsAll = false;
    } else if (prog.step2_score_avg != null && userScore < prog.step2_score_avg) {
      score -= 10;
      reasons.push(`Your Step 2 CK (${userScore}) is below program average (${prog.step2_score_avg})`);
    } else {
      reasons.push('Step 2 CK score matches/exceeds average');
    }
  } else {
    score -= 10;
    reasons.push('Step 2 CK score not provided in profile');
    meetsAll = false;
  }

  if (prog.min_usce_months && prog.min_usce_months > 0) {
    if (!profile.us_clinical_experience) {
      score -= 20;
      reasons.push(`Requires US Clinical Experience (${prog.min_usce_months} months)`);
      meetsAll = false;
    } else {
      reasons.push('Meets US Clinical Experience preference');
    }
  }

  const userGradYear = profile.graduation_year != null ? Number(profile.graduation_year) : null;
  if (userGradYear != null && !Number.isNaN(userGradYear) && prog.grad_year_cutoff) {
    const yearsSinceGrad = currentYear - userGradYear;
    if (yearsSinceGrad > prog.grad_year_cutoff) {
      score -= 15;
      reasons.push(
        `Graduation cutoff is ${prog.grad_year_cutoff} years (You: ${yearsSinceGrad} years)`
      );
      meetsAll = false;
    } else {
      reasons.push('Within graduation year cutoff');
    }
  }

  score = Math.max(10, Math.min(100, score));
  return { score, reasons, meetsAll, visaIssue };
}

const STOP_WORDS = new Set([
  'in', 'at', 'the', 'of', 'and', 'for', 'to', 'near', 'on', 'with', 'a', 'an', 'is', 'by', 'program', 'residency'
]);

export function matchesSearchQuery(prog, searchQuery) {
  const q = normalizeSearchText(searchQuery);
  if (!q) return true;

  const stateCode = prog.state ? String(prog.state).trim().toUpperCase() : '';
  const stateNames = stateCode ? normalizeStateTerm(stateCode) : [];
  const inferredRegion = prog.region || getRegionForState(stateCode) || '';

  const haystackParts = [
    prog.program_name,
    prog.name,
    prog.title,
    prog.institution,
    prog.city,
    prog.state,
    ...stateNames,
    prog.region,
    inferredRegion,
    Array.isArray(prog.specialty) ? prog.specialty.join(' ') : prog.specialty,
    prog.subspecialty,
    prog.nrmp_code,
    prog.acgme_program_number,
    prog.program_director,
    prog.description,
  ].filter(Boolean);

  const haystack = haystackParts.join(' ').toLowerCase();

  // 1. Direct whole-query substring match
  if (haystack.includes(q)) return true;

  // 2. Expand medical synonyms for whole query (e.g., "peds hemonc", "obsetrics")
  const wholeQuerySynonyms = expandMedicalSearchTerms(q);
  for (const syn of wholeQuerySynonyms) {
    if (syn && haystack.includes(syn.toLowerCase())) {
      return true;
    }
  }

  // 3. Tokenize into meaningful keywords (strip common English stop words)
  const rawTokens = q.split(/[,;\s]+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter(t => !STOP_WORDS.has(t));
  const tokensToMatch = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

  // 4. All meaningful query terms must match (AND condition across concepts)
  return tokensToMatch.every((token) => {
    // Exact token match
    if (haystack.includes(token)) return true;

    // State expansion (e.g., "wv" -> "west virginia")
    const stateVariants = normalizeStateTerm(token).map(s => s.toLowerCase());
    if (stateVariants.some(sv => haystack.includes(sv))) return true;

    // Medical synonyms for this token (e.g., "peds" -> "pediatrics", "im" -> "internal medicine")
    const tokenSynonyms = expandMedicalSearchTerms(token);
    if (tokenSynonyms.some(ts => ts && haystack.includes(ts.toLowerCase()))) return true;

    return false;
  });
}

/**
 * Filter residency programs by search + advanced filters + optional fit gate.
 */
export function filterIMGPrograms(programs, filters = {}, profile = null, fitFn = calculateFitScore) {
  const {
    searchQuery = '',
    specialty = 'all',
    specialties = [],
    locations = [],
    region = 'all',
    regions = [],
    state = 'all',
    states = [],
    visa = 'all',
    size = 'all',
    format = 'all',
    fitOnly = false,
  } = filters;

  const activeSpecialties = Array.isArray(specialties) && specialties.length > 0
    ? specialties.filter(s => s && s !== 'all')
    : (specialty && specialty !== 'all' ? [specialty] : []);

  const activeLocations = Array.isArray(locations) && locations.length > 0
    ? locations.filter(l => l && l !== 'all')
    : [];

  const activeRegions = Array.isArray(regions) && regions.length > 0
    ? regions.filter(r => r && r !== 'all')
    : (region && region !== 'all' ? [region] : []);

  const activeStates = Array.isArray(states) && states.length > 0
    ? states.filter(s => s && s !== 'all')
    : (state && state !== 'all' ? [state] : []);

  return (programs || []).filter((prog) => {
    if (!matchesSearchQuery(prog, searchQuery)) return false;

    // OR logic for specialties (match if program specialty matches ANY active specialty)
    if (activeSpecialties.length > 0) {
      const matchSpec = activeSpecialties.some(spec => {
        const target = spec.toLowerCase();
        if (Array.isArray(prog.specialty)) {
          return prog.specialty.some(s => s.toLowerCase().includes(target));
        }
        return (prog.specialty || '').toLowerCase().includes(target);
      });
      if (!matchSpec) return false;
    }

    // OR logic for locations (match if program city/state matches ANY active location chip)
    if (activeLocations.length > 0) {
      const matchLoc = activeLocations.some(loc => {
        const q = loc.toLowerCase().trim();
        const parsed = parseLocationLabel(loc);
        const stateTerms = normalizeStateTerm(parsed.state || loc).map(s => s.toLowerCase());

        const city = (prog.city || '').toLowerCase();
        const stateStr = (prog.state || '').toLowerCase();
        const cityState = `${city}, ${stateStr}`;

        // Case 1: Whole state filter (e.g., "West Virginia (Entire State)", "WV", "California")
        if (parsed.state && !parsed.city) {
          return stateTerms.some(st => stateStr === st || stateStr.includes(st));
        }

        // Case 2: City + State filter (e.g., "Huntington, WV")
        if (parsed.city && parsed.state) {
          const matchesCity = city.includes(parsed.city.toLowerCase());
          const matchesState = stateTerms.some(st => stateStr === st || stateStr.includes(st));
          return matchesCity && matchesState;
        }

        // Case 3: Fallback general text search
        return (
          city.includes(q) ||
          stateTerms.some(st => stateStr === st || stateStr.includes(st)) ||
          cityState.includes(q) ||
          (parsed.city && city.includes(parsed.city.toLowerCase()))
        );
      });
      if (!matchLoc) return false;
    }

    if (activeRegions.length > 0) {
      const progRegion = prog.region || getRegionForState(prog.state) || '';
      const isMatch = activeRegions.some(reg => {
        if (reg === progRegion) return true;
        if (reg === 'South' && (progRegion === 'Mid-Atlantic' || progRegion === 'Southwest')) return true;
        if (reg === 'East Coast' && (progRegion === 'Northeast' || progRegion === 'Mid-Atlantic' || progRegion === 'South')) return true;
        return false;
      });
      if (!isMatch) return false;
    }

    if (activeStates.length > 0) {
      const expandedActiveStates = activeStates.flatMap(s => normalizeStateTerm(s).map(st => st.toUpperCase()));
      if (!expandedActiveStates.includes((prog.state || '').toUpperCase())) return false;
    }

    const hasJ1 = Boolean(prog.visa_j1 || prog.j1_visa);
    const hasH1B = Boolean(prog.visa_h1b || prog.h1b_visa);
    if (visa === 'j1' && !hasJ1) return false;
    if (visa === 'h1b' && !hasH1B) return false;

    if (prog.program_size != null) {
      const sizeVal = Number(prog.program_size) || 0;
      if (size === 'small' && sizeVal >= 50) return false;
      if (size === 'medium' && (sizeVal < 50 || sizeVal > 100)) return false;
      if (size === 'large' && sizeVal <= 100) return false;
    }

    if (format !== 'all' && prog.interview_format && prog.interview_format !== format) return false;

    if (fitOnly) {
      const fit = fitFn(prog, profile);
      if (!(fit.meetsAll && !fit.visaIssue)) return false;
    }

    return true;
  });
}

export function buildFitScoreMap(programs, profile, options = {}) {
  const map = {};
  for (const prog of programs || []) {
    map[prog.id] = calculateFitScore(prog, profile, options);
  }
  return map;
}

export function sortPrograms(programs, sortBy = 'fit', fitMap = {}) {
  const list = [...(programs || [])];

  const byName = (a, b) =>
    String(a.program_name || a.name || '').localeCompare(String(b.program_name || b.name || ''));

  if (sortBy === 'name') {
    return list.sort(byName);
  }

  if (sortBy === 'deadline') {
    return list.sort((a, b) => {
      const da = a.application_deadline ? new Date(a.application_deadline).getTime() : Infinity;
      const db = b.application_deadline ? new Date(b.application_deadline).getTime() : Infinity;
      if (da !== db) return da - db;
      return byName(a, b);
    });
  }

  // default: fit
  return list.sort((a, b) => {
    const sa = fitMap[a.id]?.score ?? 0;
    const sb = fitMap[b.id]?.score ?? 0;
    if (sb !== sa) return sb - sa;
    return byName(a, b);
  });
}

export function sanitizeIlikeTerm(raw = '') {
  return String(raw)
    .trim()
    .replace(/[%_,.()]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 80);
}

export function normalizeProgramCounts(program) {
  if (!program) return program;
  const notesCount =
    program.program_notes_count ??
    program.program_notes?.[0]?.count ??
    (Array.isArray(program.program_notes) ? program.program_notes.length : 0) ??
    0;
  const scamCount =
    program.scam_reports_count ??
    program.scam_reports?.[0]?.count ??
    (Array.isArray(program.scam_reports) ? program.scam_reports.length : 0) ??
    0;

  return {
    ...program,
    program_notes_count: Number(notesCount) || 0,
    scam_reports_count: Number(scamCount) || 0,
  };
}

export function hasActiveIMGFilters(filters = {}) {
  const hasSpecialties =
    (Array.isArray(filters.specialties) && filters.specialties.length > 0) ||
    (filters.specialty && filters.specialty !== 'all');

  const hasLocations =
    Array.isArray(filters.locations) && filters.locations.length > 0;

  const hasRegions =
    (Array.isArray(filters.regions) && filters.regions.length > 0) ||
    (filters.region && filters.region !== 'all');

  const hasStates =
    (Array.isArray(filters.states) && filters.states.length > 0) ||
    (filters.state && filters.state !== 'all');

  return Boolean(
    (filters.searchQuery && filters.searchQuery.trim()) ||
      hasSpecialties ||
      hasLocations ||
      hasRegions ||
      hasStates ||
      (filters.visa && filters.visa !== 'all') ||
      (filters.size && filters.size !== 'all') ||
      (filters.format && filters.format !== 'all') ||
      filters.fitOnly
  );
}
