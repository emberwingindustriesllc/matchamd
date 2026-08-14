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

// Batch 1: Initial ACGME OB/GYN Candidate Batch
const batch1Candidates = [
  {
    acgme_program_number: '2201031067',
    program_name: 'MedStar Health/Washington Hospital Center Program',
    institution: 'MedStar Health',
    city: 'Washington',
    state: 'DC',
    website: 'https://www.medstarhealth.org/education/residency-programs/obstetrics-and-gynecology-obgyn',
    program_director: 'Melanie S. Harrison, MD',
    pgy1_positions: 7,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.medstarhealth.org'
  },
  {
    acgme_program_number: '2201611088',
    program_name: 'Mount Sinai Hospital Medical Center of Chicago Program',
    institution: 'Mount Sinai Hospital',
    city: 'Chicago',
    state: 'IL',
    website: 'https://www.sinaichicago.org/en/education/obgyn-residency/',
    program_director: 'Richard Trester, MD',
    pgy1_positions: 4,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.sinaichicago.org'
  },
  {
    acgme_program_number: '2202411125',
    program_name: "Mass General Brigham/Brigham and Women's Hospital/Massachusetts General Hospital Program",
    institution: "Mass General Brigham / Brigham and Women's",
    city: 'Boston',
    state: 'MA',
    website: 'https://www.brighamandwomens.org/obgyn/residency-program',
    program_director: 'Omari J. Young, MD',
    pgy1_positions: 13,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.brighamandwomens.org'
  },
  {
    acgme_program_number: '2203312163',
    program_name: 'Rutgers Health/Cooperman Barnabas Medical Center Program',
    institution: 'Rutgers Health',
    city: 'Livingston',
    state: 'NJ',
    website: 'https://njms.rutgers.edu/departments/ob_gyn/message_res.php',
    program_director: 'Lisa Pompeo, MD',
    pgy1_positions: 6,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 3,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://njms.rutgers.edu'
  },
  {
    acgme_program_number: '2203511180',
    program_name: 'BronxCare Health System Program',
    institution: 'BronxCare Health System',
    city: 'Bronx',
    state: 'NY',
    website: 'https://www.bronxcare.org/education/residency-programs/obstetrics-and-gynecology',
    program_director: 'Alireza Mehdizadeh, MD',
    pgy1_positions: 5,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.bronxcare.org'
  },
  {
    acgme_program_number: '2203521190',
    program_name: 'Zucker School of Medicine at Hofstra/Northwell Program',
    institution: 'Zucker School of Medicine / Northwell Health',
    city: 'Manhasset',
    state: 'NY',
    website: 'https://www.northwell.edu',
    program_director: 'Nagaraj Gabbur, MD',
    pgy1_positions: 7,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.northwell.edu'
  },
  {
    acgme_program_number: '2204831282',
    program_name: 'University of Texas Southwestern Medical Center Program',
    institution: 'UT Southwestern Medical Center',
    city: 'Dallas',
    state: 'TX',
    website: 'https://www.utsouthwestern.edu/education/medical-school/departments/obstetrics-gynecology/residency/',
    program_director: 'Alicia Nicole Kiszka, MD',
    pgy1_positions: 16,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.utsouthwestern.edu'
  },
  {
    acgme_program_number: '2201621089',
    program_name: 'McGaw Medical Center of Northwestern University Program',
    institution: 'Northwestern University McGaw Medical Center',
    city: 'Chicago',
    state: 'IL',
    website: 'https://www.mcgaw.northwestern.edu/training-programs/index.html',
    program_director: 'Emily Moss Hinchcliff, MD',
    pgy1_positions: 12,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 3,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.mcgaw.northwestern.edu'
  }
];

async function stageBatch() {
  const batchId = 'OBGYN-2026-08-14-001';
  console.log(`=== Staging Candidate Batch ${batchId} ===\n`);

  // 1. Upsert batch record
  const { data: batchData, error: batchErr } = await supabase
    .from('obgyn_import_batches')
    .upsert({
      batch_id: batchId,
      source: 'ACGME / FREIDA / Direct Web Verification',
      source_date: new Date().toISOString().split('T')[0],
      status: 'staging',
      records_found: batch1Candidates.length,
      notes: 'Batch 001 - Target verified core OB/GYN residencies for reconciliation'
    })
    .select();

  if (batchErr) {
    console.error('Error creating batch record:', batchErr.message);
    console.log('Make sure `supabase_obgyn_import_schema.sql` has been executed in Supabase SQL editor.');
    return;
  }

  console.log(`Created batch record: ${batchId}`);

  // 2. Insert candidate rows
  let staged = 0;
  for (const cand of batch1Candidates) {
    const { error: candErr } = await supabase.from('obgyn_program_candidates').insert({
      batch_id: batchId,
      ...cand,
      verification_status: 'pending'
    });

    if (candErr) {
      console.error(`Error inserting candidate ${cand.program_name}:`, candErr.message);
    } else {
      staged++;
    }
  }

  console.log(`Successfully staged ${staged} candidates into obgyn_program_candidates.`);

  // 3. Update batch status
  await supabase
    .from('obgyn_import_batches')
    .update({ status: 'reconciling', updated_at: new Date().toISOString() })
    .eq('batch_id', batchId);
}

stageBatch();
