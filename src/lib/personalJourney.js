export function getPreferenceSummary(profile = {}) {
  const location = profile.country || 'Not set';
  const isInUS = location === 'United States';
  const isOverseas = Boolean(location && location !== 'United States');
  const goalLabel = profile.primary_goal === 'fellowship'
    ? 'Fellowship'
    : profile.primary_goal === 'residency'
      ? 'Residency'
      : profile.primary_goal === 'med_school'
        ? 'Medical School'
        : 'Exploration';

  const focusLabel = profile.fellowship_type || profile.target_specialty || 'Open exploration';
  const visaLabel = profile.visa_status === 'J1'
    ? 'J-1 focused'
    : profile.visa_status === 'H1B'
      ? 'H-1B focused'
      : profile.visa_status === 'Citizen'
        ? 'US citizen'
        : profile.visa_status === 'GreenCard'
          ? 'Green Card holder'
          : 'Needs sponsorship';

  return {
    location,
    isInUS,
    isOverseas,
    goalLabel,
    focusLabel,
    visaLabel,
    summary: `${goalLabel} • ${focusLabel} • ${visaLabel}`,
  };
}

export function buildCustomEntry(entry = {}) {
  const rating = Number(entry.rating || 0);
  return {
    id: entry.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    entryType: entry.entryType || 'program',
    name: entry.name?.trim() || 'Untitled entry',
    category: entry.category?.trim() || 'General',
    location: entry.location?.trim() || '',
    notes: entry.notes?.trim() || '',
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, rating)) : 3,
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

export function upsertCustomEntry(entries = [], entry = {}) {
  const normalized = buildCustomEntry(entry);
  const existing = entries.find(item => item.id === normalized.id);
  if (existing) {
    return entries.map(item => item.id === normalized.id ? normalized : item);
  }
  return [normalized, ...entries];
}

export function removeCustomEntry(entries = [], entryId) {
  return entries.filter(entry => entry.id !== entryId);
}

export function getJourneyHighlights(profile = {}, customEntries = [], savedProgramsCount = 0) {
  const summaryData = getPreferenceSummary(profile);
  const savedItems = customEntries.length;
  const nextAction = summaryData.goalLabel === 'Fellowship'
    ? 'Review fellowship programs and save your top choices.'
    : summaryData.goalLabel === 'Residency'
      ? 'Explore residency programs and save your favorite fits.'
      : 'Build your shortlist and keep your notes in one place.';

  return {
    headline: `${summaryData.goalLabel} plan`,
    summary: `${summaryData.goalLabel} • ${summaryData.focusLabel} • ${summaryData.visaLabel}`,
    savedItems,
    savedPrograms: savedProgramsCount,
    nextAction,
    isOverseas: summaryData.isOverseas,
    isInUS: summaryData.isInUS,
  };
}

export function getNextActionChecklist(profile = {}, customEntries = [], savedProgramsCount = 0) {
  const highlights = getJourneyHighlights(profile, customEntries, savedProgramsCount);
  const baseActions = [
    {
      id: 'programs',
      title: 'Review Programs',
      description: 'Explore a few strong matches for your current specialty focus.',
      accent: 'from-indigo-500 to-violet-500',
    },
    {
      id: 'notes',
      title: 'Capture Notes',
      description: 'Save the reasons a program or school stands out for you.',
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'followup',
      title: 'Plan Follow-Up',
      description: 'Set the next step for deadlines, interviews, or advisor outreach.',
      accent: 'from-amber-500 to-orange-500',
    },
  ];

  if (highlights.isOverseas) {
    baseActions.unshift({
      id: 'visa',
      title: 'Confirm Logistics',
      description: 'Double-check visa, housing, and travel timing for your next visit.',
      accent: 'from-sky-500 to-cyan-500',
    });
  }

  return baseActions.slice(0, 3);
}
