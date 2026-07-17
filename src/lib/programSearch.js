/**
 * Pure helpers for IMG program directory search, fit scoring, and sorting.
 * Kept free of React so they can be unit-tested.
 */

export function normalizeSearchText(value = '') {
  return String(value).trim().toLowerCase();
}

/**
 * Calculate how well a residency program fits a user profile.
 * @param {object} prog
 * @param {object|null} profile
 * @param {{ currentYear?: number }} [options]
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

  const haystack = [
    prog.program_name,
    prog.institution,
    prog.city,
    prog.state,
    prog.specialty,
    prog.subspecialty,
    prog.region,
    prog.nrmp_code,
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase())
    .join(' ');

  return haystack.includes(q);
}

/**
 * Filter residency programs by search + advanced filters + optional fit gate.
 * @param {object[]} programs
 * @param {object} filters
 * @param {object|null} profile
 * @param {(prog: object, profile: object|null) => object} [fitFn]
 */
export function filterIMGPrograms(programs, filters = {}, profile = null, fitFn = calculateFitScore) {
  const {
    searchQuery = '',
    specialty = 'all',
    region = 'all',
    visa = 'all',
    size = 'all',
    format = 'all',
    fitOnly = false,
  } = filters;

  return (programs || []).filter((prog) => {
    if (!matchesSearchQuery(prog, searchQuery)) return false;
    if (specialty !== 'all' && prog.specialty !== specialty) return false;
    if (region !== 'all' && prog.region !== region) return false;

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

/**
 * Build a map of programId -> fit result (memo-friendly pure function).
 */
export function buildFitScoreMap(programs, profile, options = {}) {
  const map = {};
  for (const prog of programs || []) {
    map[prog.id] = calculateFitScore(prog, profile, options);
  }
  return map;
}

/**
 * Sort programs by fit, IMG friendliness, deadline, or name.
 * @param {object[]} programs
 * @param {'fit'|'img_friendly'|'deadline'|'name'} sortBy
 * @param {Record<string, {score: number}>} fitMap
 */
export function sortPrograms(programs, sortBy = 'fit', fitMap = {}) {
  const list = [...(programs || [])];

  const byName = (a, b) =>
    String(a.program_name || '').localeCompare(String(b.program_name || ''));

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

/**
 * Sanitize free-text for PostgREST .or() ilike filters.
 */
export function sanitizeIlikeTerm(raw = '') {
  return String(raw)
    .trim()
    .replace(/[%_,.()]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 80);
}

/**
 * Normalize nested PostgREST count aggregates on community programs.
 */
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
  return Boolean(
    (filters.searchQuery && filters.searchQuery.trim()) ||
      (filters.specialty && filters.specialty !== 'all') ||
      (filters.region && filters.region !== 'all') ||
      (filters.visa && filters.visa !== 'all') ||
      (filters.size && filters.size !== 'all') ||
      (filters.format && filters.format !== 'all') ||
      filters.fitOnly
  );
}
