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

async function testMigration() {
  console.log('Testing RPC / Schema migration...');
  const sql = fs.readFileSync(path.resolve(process.cwd(), 'supabase_obgyn_import_schema.sql'), 'utf-8');
  
  // Try calling exec or rpc
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.log('RPC exec_sql not available:', error.message);
  } else {
    console.log('Successfully executed migration via RPC!');
  }
}

testMigration();
