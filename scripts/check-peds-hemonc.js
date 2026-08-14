import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkPedsHemOnc() {
  console.log('=== Checking Pediatric Hematology-Oncology Programs in Supabase ===\n');

  let offset = 0;
  const limit = 1000;
  let matches = [];

  while (true) {
    const { data } = await supabase
      .from('programs')
      .select('id, name, specialty, program_type, city, state, acgme_program_number, website, program_director')
      .range(offset, offset + limit - 1);

    if (!data || data.length === 0) break;

    data.forEach(p => {
      const spec = JSON.stringify(p.specialty || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      if (
        spec.includes('pediatric hematology') || spec.includes('peds hem') || spec.includes('pediatric oncology') ||
        name.includes('pediatric hematology') || name.includes('pediatric oncology') || name.includes('peds hem')
      ) {
        matches.push(p);
      }
    });

    if (data.length < limit) break;
    offset += limit;
  }

  console.log(`Found ${matches.length} Pediatric Hematology-Oncology programs in database:`);
  matches.forEach((p, idx) => {
    console.log(`${idx + 1}. [${p.id}] ${p.name} (${p.city}, ${p.state}) | Specialty: ${JSON.stringify(p.specialty)} | Type: ${p.program_type} | ACGME: ${p.acgme_program_number}`);
  });
}

checkPedsHemOnc();
