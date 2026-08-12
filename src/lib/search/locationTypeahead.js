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

/**
 * Filter cached locations by query.
 * Matches against "City, ST" label, city, or state.
 */
export function filterLocations(query, limit = 15) {
  if (!locationCache) return [];
  if (!query || query.trim() === '') {
    return locationCache.slice(0, limit);
  }

  const q = query.toLowerCase().trim();
  const matches = locationCache.filter(loc =>
    (loc.location_label || '').toLowerCase().includes(q) ||
    (loc.city || '').toLowerCase().includes(q) ||
    (loc.state || '').toLowerCase().includes(q)
  );
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
