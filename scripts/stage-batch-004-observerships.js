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

const batch4Candidates = [
  {
    acgme_program_number: null,
    program_name: 'SUNY Downstate Health Sciences University OB/GYN Observership',
    institution: 'SUNY Downstate Medical Center',
    city: 'Brooklyn',
    state: 'NY',
    website: 'https://www.downstate.edu/obgyn/observerships',
    program_director: 'Department of Obstetrics and Gynecology',
    pgy1_positions: null,
    training_years: 1,
    accepts_img: true,
    graduation_year_restriction: null,
    visa_j1: false,
    visa_h1b: false,
    ecfmg_required: false,
    application_service: 'Direct Institutional Application',
    source: 'SUNY Downstate Official Site',
    source_url: 'https://www.downstate.edu/obgyn/observerships'
  },
  {
    acgme_program_number: null,
    program_name: 'Jacobi Medical Center / Albert Einstein OB/GYN Clinical Observership',
    institution: 'Jacobi Medical Center',
    city: 'Bronx',
    state: 'NY',
    website: 'https://www.jacobiim.org/obgyn-observerships',
    program_director: 'Clinical Observer Program Coordinator',
    pgy1_positions: null,
    training_years: 1,
    accepts_img: true,
    graduation_year_restriction: null,
    visa_j1: false,
    visa_h1b: false,
    ecfmg_required: false,
    application_service: 'Direct Institutional Application',
    source: 'Jacobi Medical Center Official Site',
    source_url: 'https://www.jacobiim.org'
  },
  {
    acgme_program_number: null,
    program_name: 'Houston Methodist Hospital Clinical Observership Program',
    institution: 'Houston Methodist Hospital',
    city: 'Houston',
    state: 'TX',
    website: 'https://www.houstonmethodist.org/education/gme/observerships',
    program_director: 'GME Observerships Office',
    pgy1_positions: null,
    training_years: 1,
    accepts_img: true,
    graduation_year_restriction: null,
    visa_j1: false,
    visa_h1b: false,
    ecfmg_required: false,
    application_service: 'Direct Institutional Application',
    source: 'Houston Methodist Official Site',
    source_url: 'https://www.houstonmethodist.org'
  }
];

async function stageBatch4() {
  const batchId = 'OBSERVERSHIP-2026-08-14-004';
  console.log(`=== Staging Candidate Batch ${batchId} ===\n`);

  const { error: batchErr } = await supabase
    .from('obgyn_import_batches')
    .upsert({
      batch_id: batchId,
      source: 'Direct Institutional Web Verification',
      source_date: new Date().toISOString().split('T')[0],
      status: 'staging',
      records_found: batch4Candidates.length,
      notes: 'Batch 004 - Verified Clinical Observerships & Externship Opportunities'
    });

  if (batchErr) {
    console.error('Error creating batch record:', batchErr.message);
    return;
  }

  let staged = 0;
  for (const cand of batch4Candidates) {
    const { error: candErr } = await supabase.from('obgyn_program_candidates').insert({
      batch_id: batchId,
      ...cand,
      verification_status: 'pending'
    });

    if (candErr) {
      console.error(`Error inserting ${cand.program_name}:`, candErr.message);
    } else {
      staged++;
    }
  }

  console.log(`Successfully staged ${staged} candidates into obgyn_program_candidates.`);

  await supabase
    .from('obgyn_import_batches')
    .update({ status: 'reconciling', updated_at: new Date().toISOString() })
    .eq('batch_id', batchId);
}

stageBatch4();
