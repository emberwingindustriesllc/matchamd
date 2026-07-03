import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src', 'data', 'international-medical-schools.js');
const outPath = path.join(process.cwd(), 'supabase_seed_international_med_schools.sql');

const content = fs.readFileSync(dataPath, 'utf8');

const schoolsMatch = content.match(/export const internationalMedicalSchools = ({[\s\S]*?});\n/);
if (!schoolsMatch) throw new Error('Could not parse internationalMedicalSchools');

const body = schoolsMatch[1];

function extractObjectKeysAndArrays(objStr) {
  const entries = [];
  const countryRegex = /\s+'([^']+)':\s+\[([\s\S]*?)\]/g;

  const m = objStr.match(/\s+'([^']+)':\s+\[([\s\S]*?)\]\s*,?\s*(?='[A-Z]|$)/);
  // Manual parse
  const lines = objStr.split('\n');
  let country = null;
  const current = [];

  for (const line of lines) {
    const countryStart = line.match(/^\s+'([^']+)':\s+\[/);
    if (countryStart) {
      if (country && current.length) entries.push({ country, entries: [...current] });
      country = countryStart[1];
      current.length = 0;
      continue;
    }
    const entry = line.match(/^\s+\{\s*school:\s*'([^']+)',\s*city:\s*'([^']+)'\s*\}/);
    if (entry && country) {
      current.push({ school: entry[1], city: entry[2] });
    }
  }
  if (country && current.length) entries.push({ country, entries: [...current] });
  return entries;
}

const data = extractObjectKeysAndArrays(body);

const lines = [];
lines.push("-- Seed international medical schools into programs");
lines.push("-- Generated from src/data/international-medical-schools.js");
lines.push("BEGIN;");
lines.push('');
lines.push("-- Extend program_type to include med_school and add missing columns");
lines.push("DROP INDEX IF EXISTS idx_programs_program_type;");
lines.push("ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_program_type_check;");
lines.push("ALTER TABLE programs ADD CONSTRAINT programs_program_type_check CHECK (program_type IN ('residency','fellowship','observership','research','elective','med_school'));");
lines.push("CREATE INDEX IF NOT EXISTS idx_programs_program_type ON programs(program_type);");
lines.push("ALTER TABLE programs ADD COLUMN IF NOT EXISTS city text;");
lines.push("ALTER TABLE programs ADD COLUMN IF NOT EXISTS state text;");
lines.push("ALTER TABLE programs ADD COLUMN IF NOT EXISTS country text;");
lines.push("ALTER TABLE programs ADD COLUMN IF NOT EXISTS is_acgme_accredited boolean DEFAULT false;");
lines.push("ALTER TABLE programs ADD COLUMN IF NOT EXISTS ecfmg_pathway_eligible boolean DEFAULT false;");
lines.push("ALTER TABLE programs ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;");
lines.push("ALTER TABLE programs ADD COLUMN IF NOT EXISTS description text;");
lines.push("");
lines.push("-- Insert programs");
for (const { country, entries } of data) {
  for (const { school, city } of entries) {
    const esc = (s) => String(s).replace(/'/g, "''");
    lines.push(`INSERT INTO programs (name, city, state, country, program_type, is_acgme_accredited, ecfmg_pathway_eligible, verified, description)`);
    lines.push(`VALUES ('${esc(school)}', '${esc(city)}', NULL, '${esc(country)}', 'med_school', false, false, false, 'International medical school import from Wikipedia/WDOMS list.');`);
  }
}
lines.push('');
lines.push("COMMIT;");

fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log('Wrote', outPath, 'with', data.reduce((n, g) => n + g.entries.length, 0), 'programs');
