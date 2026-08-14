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

async function inspectAll() {
  console.log('--- Scanning full database (12,503 rows) with pagination ---');
  let offset = 0;
  const limit = 1000;
  let totalRead = 0;
  let obgynMatches = [];

  while (true) {
    const { data, error } = await supabase
      .from('programs')
      .select('id, name, specialty, program_type, city, state, acgme_program_number, website, program_director, verified')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error at offset', offset, error);
      break;
    }
    if (!data || data.length === 0) break;

    totalRead += data.length;

    data.forEach(p => {
      const spec = JSON.stringify(p.specialty || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      if (
        spec.includes('obgyn') || spec.includes('ob/gyn') || spec.includes('obstetric') || spec.includes('gynecol') ||
        name.includes('obgyn') || name.includes('ob/gyn') || name.includes('obstetric') || name.includes('gynecol')
      ) {
        obgynMatches.push(p);
      }
    });

    if (data.length < limit) break;
    offset += limit;
  }

  console.log(`Scanned ${totalRead} total rows. Found ${obgynMatches.length} OB/GYN programs in DB.`);

  let acgmeCount = 0;
  let websiteCount = 0;
  let pdCount = 0;

  obgynMatches.forEach((p, idx) => {
    if (p.acgme_program_number) acgmeCount++;
    if (p.website) websiteCount++;
    if (p.program_director) pdCount++;

    console.log(`${idx + 1}. [${p.id}] ${p.name} (${p.city}, ${p.state}) | Specialty: ${JSON.stringify(p.specialty)} | ACGME: ${p.acgme_program_number} | Web: ${p.website} | PD: ${p.program_director}`);
  });

  console.log(`\nQuality Breakdown for ${obgynMatches.length} OB/GYN programs:`);
  console.log(`- Has ACGME Number: ${acgmeCount}`);
  console.log(`- Has Website: ${websiteCount}`);
  console.log(`- Has Program Director: ${pdCount}`);
}

inspectAll();
