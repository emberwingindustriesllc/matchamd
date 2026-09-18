import { supabase } from '@/api/supabaseClient';

let locationCache = null;

/**
 * Load the full location list from the search_locations view.
 * Call once on page load / component mount.
 */
export async function loadLocations() {
  if (locationCache) return locationCache;

  const { data, error } = await supabase
    .from('search_locations')
    .select('city, state, location_label, program_count')
    .order('program_count', { ascending: false });

  if (error) {
    console.error('Failed to load locations:', error);
    return [];
  }

  locationCache = data || [];
  return locationCache;
}

const DEFAULT_LOCATIONS = [
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

/**
 * Filter cached locations by query.
 * Matches against "City, ST" label, city, or state.
 */
export function filterLocations(query, limit = 15) {
  const pool = (locationCache && locationCache.length > 0) ? locationCache : DEFAULT_LOCATIONS;
  if (!query || query.trim() === '') {
    return pool.slice(0, limit);
  }

  const q = query.toLowerCase().trim();
  const matches = pool.filter(loc =>
    (loc.location_label || '').toLowerCase().includes(q) ||
    (loc.city || '').toLowerCase().includes(q) ||
    (loc.state || '').toLowerCase().includes(q)
  );

  // If Supabase cache didn't have matches but DEFAULT_LOCATIONS might, fallback search DEFAULT_LOCATIONS
  if (matches.length === 0 && pool !== DEFAULT_LOCATIONS) {
    return DEFAULT_LOCATIONS.filter(loc =>
      (loc.location_label || '').toLowerCase().includes(q) ||
      (loc.city || '').toLowerCase().includes(q) ||
      (loc.state || '').toLowerCase().includes(q)
    ).slice(0, limit);
  }

  return matches.slice(0, limit);
}

/**
 * Parse a location string like "Cleveland, OH" into { city, state }.
 */
export function parseLocationLabel(label) {
  if (!label) return { city: '', state: '' };
  const trimmed = label.trim();
  const commaIdx = trimmed.lastIndexOf(',');
  if (commaIdx > 0) {
    const city = trimmed.slice(0, commaIdx).trim();
    const state = trimmed.slice(commaIdx + 1).trim();
    if (city && state) return { city, state };
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
