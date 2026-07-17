/**
 * Single source of truth for MatchaMD pathway steps.
 * Used by Guides, Dashboard, tests, and progress calculations.
 */

export const pathways = {
  residency: {
    key: 'residency',
    title: 'Residency',
    color: 'from-[rgb(var(--color-primary))] to-[rgb(var(--color-secondary))]',
    iconKey: 'Stethoscope',
    steps: [
      {
        id: 'ecfmg_pathways',
        title: 'ECFMG Pathways',
        description: 'Complete one of 6 pathways to certification',
        deadline: 'Jan 31, 2026',
      },
      {
        id: 'usmle_step1',
        title: 'USMLE Step 1',
        description: 'First licensing exam covering basic sciences',
      },
      {
        id: 'usmle_step2',
        title: 'USMLE Step 2 CK',
        description: 'Clinical knowledge examination - aim for high score!',
      },
      {
        id: 'oet_medicine',
        title: 'OET Medicine',
        description: 'Occupational English Test for healthcare professionals',
        deadline: 'Dec 2025',
      },
      {
        id: 'clinical_experience',
        title: 'US Clinical Experience',
        description: 'Critical for competitive specialties - hands-on rotations at US programs',
      },
      {
        id: 'research',
        title: 'Research Experience',
        description: 'Essential for competitive specialties - publications strengthen your CV',
      },
      {
        id: 'eras_registration',
        title: 'ERAS Registration',
        description: 'Electronic Residency Application Service',
        deadline: 'Sept 2025',
      },
      {
        id: 'personal_statement',
        title: 'Personal Statement',
        description: 'Your unique story and motivation',
      },
      {
        id: 'lors',
        title: 'Letters of Recommendation',
        description: 'Strong letters from physicians',
      },
      {
        id: 'program_research',
        title: 'Program Research',
        description: 'Find IMG-friendly programs',
      },
      {
        id: 'interviews',
        title: 'Interview Preparation',
        description: 'Prepare for virtual and in-person interviews',
      },
      {
        id: 'nrmp_match',
        title: 'NRMP Match',
        description: 'National Resident Matching Program',
        deadline: 'March 2026',
      },
      {
        id: 'visa',
        title: 'Visa Planning',
        description: 'J-1 or H-1B visa requirements',
      },
    ],
  },
  fellowship: {
    key: 'fellowship',
    title: 'Fellowship',
    color: 'from-emerald-500 to-teal-500',
    iconKey: 'GraduationCap',
    steps: [
      {
        id: 'ecfmg_certification',
        title: 'ECFMG Certification',
        description: 'Required for fellowship training',
      },
      {
        id: 'residency_completion',
        title: 'Residency Completion',
        description: 'Complete accredited residency program',
      },
      {
        id: 'board_eligibility',
        title: 'Board Eligibility',
        description: 'Meet specialty board requirements',
      },
      {
        id: 'fellowship_eras',
        title: 'Fellowship Application',
        description: 'ERAS or Fellowship Council',
      },
      {
        id: 'fellowship_interview',
        title: 'Fellowship Interviews',
        description: 'Interview at subspecialty programs',
      },
      {
        id: 'fellowship_match',
        title: 'Fellowship Match',
        description: 'NRMP SMS or other matching systems',
      },
    ],
  },
  med_school: {
    key: 'med_school',
    title: 'Med School',
    color: 'from-amber-400 to-orange-500',
    iconKey: 'BookOpen',
    steps: [
      {
        id: 'prerequisites',
        title: 'Prerequisites',
        description: 'US coursework and requirements',
      },
      {
        id: 'mcat',
        title: 'MCAT Exam',
        description: 'Medical College Admission Test',
      },
      {
        id: 'amcas',
        title: 'AMCAS Application',
        description: 'Primary application process',
      },
      {
        id: 'secondaries',
        title: 'Secondary Applications',
        description: 'School-specific applications',
      },
      {
        id: 'med_interviews',
        title: 'Interviews',
        description: 'MMI and traditional interviews',
      },
      {
        id: 'financial_proof',
        title: 'Financial Documentation',
        description: 'Proof of funding for 4 years',
      },
      {
        id: 'school_selection',
        title: 'School Selection',
        description: 'Schools accepting internationals',
      },
    ],
  },
};

/** All step IDs across pathways (unique). */
export function getAllPathwayStepIds() {
  const ids = [];
  for (const pathway of Object.values(pathways)) {
    for (const step of pathway.steps) {
      ids.push(step.id);
    }
  }
  return ids;
}

/**
 * Steps for a user's primary goal. Defaults to residency.
 * @param {string} [primaryGoal]
 */
export function getPathwaySteps(primaryGoal) {
  const key = pathways[primaryGoal] ? primaryGoal : 'residency';
  return pathways[key].steps;
}

/**
 * Pathway meta (title, color, key) for a goal.
 */
export function getPathwayMeta(primaryGoal) {
  const key = pathways[primaryGoal] ? primaryGoal : 'residency';
  return pathways[key];
}

/**
 * Filter steps by free-text query on title + description.
 */
export function filterPathwaySteps(steps, query = '') {
  const q = String(query).trim().toLowerCase();
  if (!q) return steps || [];
  return (steps || []).filter(
    (step) =>
      step.title.toLowerCase().includes(q) ||
      (step.description && step.description.toLowerCase().includes(q))
  );
}

/**
 * Normalize pathway query param from UI (title or key) to key.
 */
export function normalizePathwayKey(value) {
  if (!value) return 'residency';
  const lower = String(value).toLowerCase().replace(/\s+/g, '_');
  if (pathways[lower]) return lower;
  if (lower === 'med_school' || lower === 'medschool') return 'med_school';
  if (lower.includes('fellow')) return 'fellowship';
  if (lower.includes('med')) return 'med_school';
  if (lower.includes('resid')) return 'residency';
  return 'residency';
}
