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

const batch3Candidates = [
  {
    acgme_program_number: '1403521230',
    program_name: 'Lincoln Medical and Mental Health Center Program',
    institution: 'NYC Health + Hospitals / Lincoln',
    city: 'Bronx',
    state: 'NY',
    website: 'https://www.nychealthandhospitals.org/lincoln/residency-programs/internal-medicine/',
    program_director: 'Balavenkatesh Kanna, MD',
    pgy1_positions: 30,
    training_years: 3,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ERAS',
    source: 'FREIDA / AMA / Direct Verification',
    source_url: 'https://www.nychealthandhospitals.org'
  },
  {
    acgme_program_number: '1403321150',
    program_name: 'Jersey City Medical Center Program',
    institution: 'RWJBarnabas Health / JCMC',
    city: 'Jersey City',
    state: 'NJ',
    website: 'https://www.rwjbh.org/jersey-city-medical-center/medical-education/internal-medicine-residency/',
    program_director: 'Harpreet Singh, MD',
    pgy1_positions: 15,
    training_years: 3,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ERAS',
    source: 'FREIDA / AMA / Direct Verification',
    source_url: 'https://www.rwjbh.org'
  },
  {
    acgme_program_number: '1401621090',
    program_name: 'Cook County Health and Hospitals System Program',
    institution: 'John H. Stroger Jr. Hospital of Cook County',
    city: 'Chicago',
    state: 'IL',
    website: 'https://cookcountyhealth.org/education-research/gme/internal-medicine-residency/',
    program_director: 'David L. Baillie, MD',
    pgy1_positions: 45,
    training_years: 3,
    accepts_img: true,
    graduation_year_restriction: 3,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ERAS',
    source: 'FREIDA / AMA / Direct Verification',
    source_url: 'https://cookcountyhealth.org'
  }
];

async function stageBatch3() {
  const batchId = 'IMG-RESIDENCY-2026-08-14-003';
  console.log(`=== Staging Candidate Batch ${batchId} ===\n`);

  const { error: batchErr } = await supabase
    .from('obgyn_import_batches')
    .upsert({
      batch_id: batchId,
      source: 'FREIDA / High-Yield IMG Residency Research',
      source_date: new Date().toISOString().split('T')[0],
      status: 'staging',
      records_found: batch3Candidates.length,
      notes: 'Batch 003 - High-Yield IMG-Friendly Internal Medicine & Family Medicine Residencies'
    });

  if (batchErr) {
    console.error('Error creating batch record:', batchErr.message);
    return;
  }

  let staged = 0;
  for (const cand of batch3Candidates) {
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

stageBatch3();
