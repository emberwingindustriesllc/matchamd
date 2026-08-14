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

const batch5Candidates = [
  {
    acgme_program_number: '2201621092',
    program_name: 'University of Illinois College of Medicine at Chicago Program',
    institution: 'University of Illinois Hospital & Health Sciences System',
    city: 'Chicago',
    state: 'IL',
    website: 'https://chicago.obgyn.uillinois.edu/education/residency-program/',
    program_director: 'Stacie Geller, MD',
    pgy1_positions: 7,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://chicago.obgyn.uillinois.edu'
  },
  {
    acgme_program_number: '2201621094',
    program_name: 'Loyola University Medical Center Program',
    institution: 'Loyola University Health System',
    city: 'Maywood',
    state: 'IL',
    website: 'https://www.loyolamedicine.org/gme/residencies/obgyn',
    program_director: 'Frederic J. Cohen, MD',
    pgy1_positions: 6,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.loyolamedicine.org'
  },
  {
    acgme_program_number: '2201621095',
    program_name: 'Rush University Medical Center Program',
    institution: 'Rush University Medical Center',
    city: 'Chicago',
    state: 'IL',
    website: 'https://www.rushu.rush.edu/education-and-training/graduate-medical-education/residency-programs/obstetrics-and-gynecology',
    program_director: 'Xavier A. Pombar, DO',
    pgy1_positions: 6,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.rushu.rush.edu'
  },
  {
    acgme_program_number: '2201611096',
    program_name: 'Southern Illinois University School of Medicine Program',
    institution: 'SIU School of Medicine',
    city: 'Springfield',
    state: 'IL',
    website: 'https://www.siumed.edu/obgyn/residency-program.html',
    program_director: 'Casey Younkin, MD',
    pgy1_positions: 4,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.siumed.edu'
  },
  {
    acgme_program_number: '2201700201',
    program_name: 'Parkview Health Program',
    institution: 'Parkview Regional Medical Center',
    city: 'Fort Wayne',
    state: 'IN',
    website: 'https://www.parkview.com/gme/obgyn-residency',
    program_director: 'Mitchell A. Stotland, MD',
    pgy1_positions: 4,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.parkview.com'
  },
  {
    acgme_program_number: '2202511130',
    program_name: 'Henry Ford Hospital Program',
    institution: 'Henry Ford Health System',
    city: 'Detroit',
    state: 'MI',
    website: 'https://www.henryford.com/hcp/med-ed/residencies-fellowships/obgyn',
    program_director: 'Adnan R. Munkarah, MD',
    pgy1_positions: 7,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.henryford.com'
  },
  {
    acgme_program_number: '2202512135',
    program_name: 'Henry Ford Jackson Hospital Program',
    institution: 'Henry Ford Jackson Hospital',
    city: 'Jackson',
    state: 'MI',
    website: 'https://www.henryford.com/hcp/med-ed/residencies-fellowships/jackson/obgyn',
    program_director: 'Michael A. Langan, MD',
    pgy1_positions: 4,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.henryford.com'
  },
  {
    acgme_program_number: '2203100210',
    program_name: 'Kirk Kerkorian School of Medicine at UNLV Program',
    institution: 'University of Nevada Las Vegas',
    city: 'Las Vegas',
    state: 'NV',
    website: 'https://www.unlv.edu/medicine/obgyn/residency',
    program_director: 'Vani S. Dandolu, MD',
    pgy1_positions: 6,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.unlv.edu'
  }
];

async function stageBatch5() {
  const batchId = 'OBGYN-2026-08-14-005';
  console.log(`=== Staging Candidate Batch ${batchId} ===\n`);

  const { error: batchErr } = await supabase
    .from('obgyn_import_batches')
    .upsert({
      batch_id: batchId,
      source: 'ACGME / FREIDA / Direct Web Verification',
      source_date: new Date().toISOString().split('T')[0],
      status: 'staging',
      records_found: batch5Candidates.length,
      notes: 'Batch 005 - Core OB/GYN Residencies (Midwest & West Expansion)'
    });

  if (batchErr) {
    console.error('Error creating batch record:', batchErr.message);
    return;
  }

  let staged = 0;
  for (const cand of batch5Candidates) {
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

stageBatch5();
