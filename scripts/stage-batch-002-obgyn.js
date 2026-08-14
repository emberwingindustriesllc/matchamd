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

const batch2Candidates = [
  {
    acgme_program_number: '2203521191',
    program_name: 'New York Medical College at Saint Josephs Health Program',
    institution: 'Saint Josephs Health / NYMC',
    city: 'Paterson',
    state: 'NJ',
    website: 'https://www.stjosephshealth.org/education/residency-programs/obgyn',
    program_director: 'Roger V. Keresztes, MD',
    pgy1_positions: 5,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.stjosephshealth.org'
  },
  {
    acgme_program_number: '2203512185',
    program_name: 'Maimonides Medical Center Program',
    institution: 'Maimonides Medical Center',
    city: 'Brooklyn',
    state: 'NY',
    website: 'https://maimonidesmed.org/residency-programs/obstetrics-gynecology',
    program_director: 'Scott Chudnoff, MD',
    pgy1_positions: 6,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://maimonidesmed.org'
  },
  {
    acgme_program_number: '2203511183',
    program_name: 'Westchester Medical Center Program',
    institution: 'Westchester Medical Center / NYMC',
    city: 'Valhalla',
    state: 'NY',
    website: 'https://www.westchestermedicalcenter.org/obgyn-residency',
    program_director: 'Tarek Elshafaki, MD',
    pgy1_positions: 6,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.westchestermedicalcenter.org'
  },
  {
    acgme_program_number: '2203611195',
    program_name: 'Cape Fear Valley Medical Center Program',
    institution: 'Cape Fear Valley Health System',
    city: 'Fayetteville',
    state: 'NC',
    website: 'https://www.capefearvalley.com/gme/obgyn.html',
    program_director: 'Robin D. Peeden, MD',
    pgy1_positions: 4,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 5,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.capefearvalley.com'
  },
  {
    acgme_program_number: '2204111230',
    program_name: 'Allegheny Health Network Medical Education Program',
    institution: 'Allegheny General Hospital / WPH',
    city: 'Pittsburgh',
    state: 'PA',
    website: 'https://www.ahn.org/education/gme/residencies/ob-gyn',
    program_director: 'Kirsten B. Lesage, MD',
    pgy1_positions: 7,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.ahn.org'
  },
  {
    acgme_program_number: '2204511252',
    program_name: 'Prisma Health-Upstate/University of South Carolina School of Medicine Greenville Program',
    institution: 'Prisma Health Upstate',
    city: 'Greenville',
    state: 'SC',
    website: 'https://www.prismahealth.org/education/gme/residencies/obgyn-greenville',
    program_director: 'Kacey Y. Eichelberger, MD',
    pgy1_positions: 6,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 3,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.prismahealth.org'
  },
  {
    acgme_program_number: '2204711265',
    program_name: 'University of Tennessee Health Science Center College of Medicine-Nashville Program',
    institution: 'UT Ascension Saint Thomas',
    city: 'Nashville',
    state: 'TN',
    website: 'https://www.uthsc.edu/obgyn/residency/nashville.php',
    program_director: 'Michael L. Bennett, MD',
    pgy1_positions: 5,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: false,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.uthsc.edu'
  },
  {
    acgme_program_number: '2204811270',
    program_name: 'Baylor University Medical Center Program',
    institution: 'Baylor Scott & White Health / All Saints',
    city: 'Dallas',
    state: 'TX',
    website: 'https://www.bswhealth.med/education/gme/bumc/residencies/obgyn',
    program_director: 'David C. Zepeda, MD',
    pgy1_positions: 6,
    training_years: 4,
    accepts_img: true,
    graduation_year_restriction: 4,
    visa_j1: true,
    visa_h1b: true,
    ecfmg_required: true,
    application_service: 'ResidencyCAS',
    source: 'ACGME / FREIDA / Program Web',
    source_url: 'https://www.bswhealth.med'
  }
];

async function stageBatch2() {
  const batchId = 'OBGYN-2026-08-14-002';
  console.log(`=== Staging Candidate Batch ${batchId} ===\n`);

  const { error: batchErr } = await supabase
    .from('obgyn_import_batches')
    .upsert({
      batch_id: batchId,
      source: 'ACGME / FREIDA / Program Web Direct',
      source_date: new Date().toISOString().split('T')[0],
      status: 'staging',
      records_found: batch2Candidates.length,
      notes: 'Batch 002 - Core OB/GYN expansion residencies with verified ACGME & visa attributes'
    });

  if (batchErr) {
    console.error('Error creating batch record:', batchErr.message);
    return;
  }

  let staged = 0;
  for (const cand of batch2Candidates) {
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

stageBatch2();
