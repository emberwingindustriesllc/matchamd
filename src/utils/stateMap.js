export const STATE_NAME_TO_CODE = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH',
  oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
  'puerto rico': 'PR', 'district of columbia': 'DC'
};

export const STATE_CODE_TO_NAME = Object.fromEntries(
  Object.entries(STATE_NAME_TO_CODE).map(([name, code]) => [code, name])
);

/**
 * Normalizes state inputs to both code and name variations.
 * e.g., 'Pennsylvania' -> ['PA', 'Pennsylvania']
 * e.g., 'PA' -> ['PA', 'Pennsylvania']
 */
export function normalizeStateTerm(term = '') {
  if (!term) return [];
  const clean = term.trim().toLowerCase();
  const code = STATE_NAME_TO_CODE[clean] || (clean.length === 2 ? clean.toUpperCase() : null);
  const name = STATE_CODE_TO_NAME[code] || clean;

  const results = new Set([clean]);
  if (code) results.add(code);
  if (name) results.add(name);
  return Array.from(results);
}

export const STATE_TO_REGION = {
  // Northeast
  CT: 'Northeast', ME: 'Northeast', MA: 'Northeast', NH: 'Northeast',
  RI: 'Northeast', VT: 'Northeast', NJ: 'Northeast', NY: 'Northeast', PA: 'Northeast',
  // Midwest
  IL: 'Midwest', IN: 'Midwest', MI: 'Midwest', OH: 'Midwest', WI: 'Midwest',
  IA: 'Midwest', KS: 'Midwest', MN: 'Midwest', MO: 'Midwest', NE: 'Midwest',
  ND: 'Midwest', SD: 'Midwest',
  // South & Mid-Atlantic
  DE: 'South', FL: 'South', GA: 'South', MD: 'South', NC: 'South',
  SC: 'South', VA: 'South', DC: 'South', WV: 'South', AL: 'South',
  KY: 'South', MS: 'South', TN: 'South', AR: 'South', LA: 'South',
  OK: 'South', TX: 'South', PR: 'South',
  // West
  AZ: 'West', CO: 'West', ID: 'West', MT: 'West', NV: 'West',
  NM: 'West', UT: 'West', WY: 'West', AK: 'West', CA: 'West',
  HI: 'West', OR: 'West', WA: 'West'
};

export function getRegionForState(stateCodeOrName = '') {
  if (!stateCodeOrName) return null;
  const clean = String(stateCodeOrName).trim();
  const code = clean.length === 2 ? clean.toUpperCase() : (STATE_NAME_TO_CODE[clean.toLowerCase()] || null);
  return STATE_TO_REGION[code] || null;
}

