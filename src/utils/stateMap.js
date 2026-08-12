const STATE_NAME_TO_CODE = {
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

const STATE_CODE_TO_NAME = Object.fromEntries(
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
