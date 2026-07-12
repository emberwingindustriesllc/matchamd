import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value.trim();
  }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', url);
if (!url || !key) {
  console.error('Missing credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('programs').select('*').limit(10);
  if (error) {
    console.error('Error fetching programs:', error);
    process.exit(1);
  }
  console.log(`Fetched ${data.length} programs from DB:`);
  data.forEach((p, idx) => {
    console.log(`\n--- Program ${idx + 1} ---`);
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.program_name || p.name}`);
    console.log(`Specialty:`, p.specialty);
    console.log(`Verified: ${p.verified}`);
    console.log(`Program Type: ${p.program_type}`);
    console.log(`City: ${p.city}, State: ${p.state}`);
  });
}

run();
