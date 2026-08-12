/**
 * Pure helpers for IMG program directory search, fit scoring, and sorting.
 * Kept free of React so they can be unit-tested.
 */
import { normalizeStateTerm } from '@/utils/stateMap';
import { parseLocationLabel } from '@/lib/search/locationTypeahead';

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

function matchesSearchQuery(prog, searchQuery) {
  const q = normalizeSearchText(searchQuery);
  if (!q) return true;

  const tokens = q.split(/[,;\s]+/).filter(Boolean);
  const expandedTokens = tokens.flatMap(token => normalizeStateTerm(token).map(t => t.toLowerCase()));

  const haystack = [
    prog.program_name,
    prog.name,
    prog.institution,
    prog.city,
    prog.state,
    Array.isArray(prog.specialty) ? prog.specialty.join(' ') : prog.specialty,
    prog.subspecialty,
    prog.region,
    prog.nrmp_code,
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase())
    .join(' ');

  if (haystack.includes(q)) return true;
  return expandedTokens.some(token => haystack.includes(token));
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
      if (!activeRegions.includes(prog.region)) return false;
    }

    if (activeStates.length > 0) {
      const expandedActiveStates = activeStates.flatMap(s => normalizeStateTerm(s).map(st => st.toUpperCase()));
      if (!expandedActiveStates.includes((prog.state || '').toUpperCase())) return false;
    }

    if (visa === 'j1' && !prog.visa_j1) return false;
    if (visa === 'h1b' && !prog.visa_h1b) return false;

    const sizeVal = Number(prog.program_size) || 0;
    if (size === 'small' && sizeVal >= 50) return false;
    if (size === 'medium' && (sizeVal < 50 || sizeVal > 100)) return false;
    if (size === 'large' && sizeVal <= 100) return false;

    if (format !== 'all' && prog.interview_format !== format) return false;

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

  if (sortBy === 'img_friendly') {
    return list.sort((a, b) => {
      const diff = (Number(b.img_friendly_score) || 0) - (Number(a.img_friendly_score) || 0);
      return diff !== 0 ? diff : byName(a, b);
    });
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
    const imgDiff = (Number(b.img_friendly_score) || 0) - (Number(a.img_friendly_score) || 0);
    return imgDiff !== 0 ? imgDiff : byName(a, b);
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
