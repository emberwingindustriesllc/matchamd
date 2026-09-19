import { supabase } from '@/api/supabaseClient';
import { STATE_NAME_TO_CODE, STATE_CODE_TO_NAME, normalizeStateTerm } from '@/utils/stateMap';

let locationCache = null;

// Generate statewide entries for all 50 states + PR & DC
const STATEWIDE_LOCATIONS = Object.entries(STATE_NAME_TO_CODE).map(([name, code]) => ({
  city: '',
  state: code,
  location_label: `${name.replace(/\b\w/g, l => l.toUpperCase())} (Entire State)`,
  program_count: 50
}));

const DEFAULT_CITY_LOCATIONS = [
  { city: 'Huntington', state: 'WV', location_label: 'Huntington, WV', program_count: 5 },
  { city: 'Morgantown', state: 'WV', location_label: 'Morgantown, WV', program_count: 6 },
  { city: 'Charleston', state: 'WV', location_label: 'Charleston, WV', program_count: 5 },
  { city: 'Wheeling', state: 'WV', location_label: 'Wheeling, WV', program_count: 2 },
  { city: 'Pittsburgh', state: 'PA', location_label: 'Pittsburgh, PA', program_count: 25 },
  { city: 'Philadelphia', state: 'PA', location_label: 'Philadelphia, PA', program_count: 35 },
  { city: 'New York', state: 'NY', location_label: 'New York, NY', program_count: 85 },
  { city: 'Brooklyn', state: 'NY', location_label: 'Brooklyn, NY', program_count: 40 },
  { city: 'Chicago', state: 'IL', location_label: 'Chicago, IL', program_count: 45 },
  { city: 'Houston', state: 'TX', location_label: 'Houston, TX', program_count: 30 },
  { city: 'Dallas', state: 'TX', location_label: 'Dallas, TX', program_count: 28 },
  { city: 'Los Angeles', state: 'CA', location_label: 'Los Angeles, CA', program_count: 40 },
  { city: 'San Francisco', state: 'CA', location_label: 'San Francisco, CA', program_count: 20 },
  { city: 'Cleveland', state: 'OH', location_label: 'Cleveland, OH', program_count: 22 },
  { city: 'Columbus', state: 'OH', location_label: 'Columbus, OH', program_count: 20 },
  { city: 'Baltimore', state: 'MD', location_label: 'Baltimore, MD', program_count: 25 },
  { city: 'Boston', state: 'MA', location_label: 'Boston, MA', program_count: 30 },
  { city: 'Miami', state: 'FL', location_label: 'Miami, FL', program_count: 26 },
  { city: 'Orlando', state: 'FL', location_label: 'Orlando, FL', program_count: 18 },
  { city: 'Detroit', state: 'MI', location_label: 'Detroit, MI', program_count: 24 },
  { city: 'Atlanta', state: 'GA', location_label: 'Atlanta, GA', program_count: 22 },
  { city: 'Washington', state: 'DC', location_label: 'Washington, DC', program_count: 15 },
];

export const DEFAULT_LOCATIONS = [
  ...STATEWIDE_LOCATIONS,
  ...DEFAULT_CITY_LOCATIONS
];

/**
 * Load the full location list from the search_locations view.
 */
export async function loadLocations() {
  if (locationCache) return locationCache;

  const { data, error } = await supabase
    .from('search_locations')
    .select('city, state, location_label, program_count')
    .order('program_count', { ascending: false });

  if (error) {
    console.error('Failed to load locations:', error);
    return DEFAULT_LOCATIONS;
  }

  // Merge database cities with statewide options
  locationCache = [
    ...STATEWIDE_LOCATIONS,
    ...(data || [])
  ];
  return locationCache;
}

/**
 * Filter cached locations by query (state name, 2-letter state code, or city).
 */
export function filterLocations(query, limit = 20) {
  const pool = (locationCache && locationCache.length > 0) ? locationCache : DEFAULT_LOCATIONS;
  if (!query || query.trim() === '') {
    return pool.slice(0, limit);
  }

  const q = query.toLowerCase().trim();
  const normalizedStateTerms = normalizeStateTerm(q).map(s => s.toLowerCase());

  const matches = pool.filter(loc => {
    const locLabel = (loc.location_label || '').toLowerCase();
    const locCity = (loc.city || '').toLowerCase();
    const locState = (loc.state || '').toLowerCase();
    const locStateName = (STATE_CODE_TO_NAME[loc.state] || '').toLowerCase();

    return (
      locLabel.includes(q) ||
      locCity.includes(q) ||
      locState === q ||
      locState.includes(q) ||
      locStateName.includes(q) ||
      normalizedStateTerms.some(st => locState === st || locStateName.includes(st))
    );
  });

  return matches.slice(0, limit);
}

/**
 * Parse a location string into { city, state }.
 * Handles:
 * - "West Virginia (Entire State)" -> { city: '', state: 'WV' }
 * - "West Virginia" -> { city: '', state: 'WV' }
 * - "WV" -> { city: '', state: 'WV' }
 * - "Huntington, WV" -> { city: 'Huntington', state: 'WV' }
 */
export function parseLocationLabel(label) {
  if (!label) return { city: '', state: '' };
  let trimmed = label.trim();

  // Strip "(Entire State)" or "(Statewide)"
  const cleanStateLabel = trimmed.replace(/\s*\((?:entire state|statewide|all statewide)\)/i, '').trim().toLowerCase();

  // Check if it matches a whole state
  if (STATE_NAME_TO_CODE[cleanStateLabel]) {
    return { city: '', state: STATE_NAME_TO_CODE[cleanStateLabel] };
  }
  if (cleanStateLabel.length === 2 && STATE_CODE_TO_NAME[cleanStateLabel.toUpperCase()]) {
    return { city: '', state: cleanStateLabel.toUpperCase() };
  }

  const commaIdx = trimmed.lastIndexOf(',');
  if (commaIdx > 0) {
    const city = trimmed.slice(0, commaIdx).trim();
    const rawState = trimmed.slice(commaIdx + 1).trim().toLowerCase();
    const parsedState = STATE_NAME_TO_CODE[rawState] || (rawState.length === 2 ? rawState.toUpperCase() : rawState.toUpperCase());
    return { city, state: parsedState };
  }

  return { city: trimmed, state: '' };
}

export function addLocationChip(state, locationLabel) {
  if (!locationLabel || state.locations.includes(locationLabel)) return state;
  return {
    ...state,
    locations: [...state.locations, locationLabel]
  };
}

export function removeLocationChip(state, locationLabel) {
  return {
    ...state,
    locations: state.locations.filter(l => l !== locationLabel)
  };
}
