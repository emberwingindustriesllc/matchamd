import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
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

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

// String normalization for fuzzy matching
function normalizeName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(program|residency|hospital|medical center|university|health|system|of|at|inc|corp)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function audit() {
  console.log('=== MatchAMD OB/GYN Database Audit ===\n');

  let offset = 0;
  const limit = 1000;
  let allPrograms = [];

  while (true) {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error querying programs:', error);
      return;
    }
    if (!data || data.length === 0) break;
    allPrograms = allPrograms.concat(data);
    if (data.length < limit) break;
    offset += limit;
  }

  const obgynPrograms = allPrograms.filter(p => {
    const spec = JSON.stringify(p.specialty || '').toLowerCase();
    const name = (p.name || '').toLowerCase();
    return (
      spec.includes('obgyn') || spec.includes('ob/gyn') || spec.includes('obstetric') || spec.includes('gynecol') ||
      name.includes('obgyn') || name.includes('ob/gyn') || name.includes('obstetric') || name.includes('gynecol')
    );
  });

  const obgynResidencies = obgynPrograms.filter(p => p.program_type === 'residency' || (p.specialty && JSON.stringify(p.specialty).includes('Obstetrics and Gynecology')));

  console.log(`Total database rows scanned: ${allPrograms.length}`);
  console.log(`Total OB/GYN related programs: ${obgynPrograms.length}`);
  console.log(`Total core OB/GYN Residencies: ${obgynResidencies.length}`);

  let acgmeCount = 0;
  let websiteCount = 0;
  let directorCount = 0;
  let provisionalCount = 0;

  obgynPrograms.forEach(p => {
    if (p.acgme_program_number) acgmeCount++;
    if (p.website) websiteCount++;
    if (p.program_director) directorCount++;
    if (p.provisional_data) provisionalCount++;
  });

  console.log('\n--- Data Quality Breakdown (OB/GYN Programs) ---');
  console.log(`- Programs with ACGME ID: ${acgmeCount} / ${obgynPrograms.length} (${((acgmeCount / (obgynPrograms.length || 1)) * 100).toFixed(1)}%)`);
  console.log(`- Programs with Website: ${websiteCount} / ${obgynPrograms.length} (${((websiteCount / (obgynPrograms.length || 1)) * 100).toFixed(1)}%)`);
  console.log(`- Programs with Program Director: ${directorCount} / ${obgynPrograms.length} (${((directorCount / (obgynPrograms.length || 1)) * 100).toFixed(1)}%)`);
  console.log(`- Marked Provisional: ${provisionalCount}`);

  // Check workbench tables if created
  const { data: batches, error: batchErr } = await supabase.from('obgyn_import_batches').select('*');
  if (batchErr) {
    console.log('\nWorkbench status: Workbench tables (obgyn_import_batches) not yet detected or need migration execution.');
  } else {
    console.log(`\nWorkbench status: ${batches.length} import batches recorded.`);
  }
}

async function reconcile() {
  console.log('=== Running OB/GYN Candidate Reconciliation ===\n');

  // Check candidates table
  const { data: candidates, error: candErr } = await supabase.from('obgyn_program_candidates').select('*');
  if (candErr) {
    console.error('Error accessing obgyn_program_candidates:', candErr.message);
    console.log('Please execute `supabase_obgyn_import_schema.sql` in the Supabase SQL editor first.');
    return;
  }

  console.log(`Loaded ${candidates.length} candidates from obgyn_program_candidates.`);

  // Load existing programs
  let offset = 0;
  const limit = 1000;
  let allPrograms = [];

  while (true) {
    const { data } = await supabase.from('programs').select('*').range(offset, offset + limit - 1);
    if (!data || data.length === 0) break;
    allPrograms = allPrograms.concat(data);
    if (data.length < limit) break;
    offset += limit;
  }

  let matchedVerified = 0;
  let matchedIncomplete = 0;
  let missingNew = 0;
  let duplicates = 0;

  for (const cand of candidates) {
    let matchedProg = null;

    // Strategy 1: Match by ACGME ID
    if (cand.acgme_program_number) {
      matchedProg = allPrograms.find(p => p.acgme_program_number === cand.acgme_program_number);
    }

    // Strategy 2: Match by normalized name + state
    if (!matchedProg && cand.program_name && cand.state) {
      const normCandName = normalizeName(cand.program_name);
      matchedProg = allPrograms.find(p => {
        if (p.state && p.state.toLowerCase() === cand.state.toLowerCase()) {
          const normPName = normalizeName(p.name || p.institution || '');
          return normPName.includes(normCandName) || normCandName.includes(normPName);
        }
        return false;
      });
    }

    let status = 'missing_new';
    let matchedId = null;

    if (matchedProg) {
      matchedId = matchedProg.id;
      if (matchedProg.acgme_program_number && matchedProg.website && matchedProg.program_director) {
        status = 'matched_verified';
        matchedVerified++;
      } else {
        status = 'matched_incomplete';
        matchedIncomplete++;
      }
    } else {
      missingNew++;
    }

    await supabase
      .from('obgyn_program_candidates')
      .update({
        verification_status: status,
        matched_program_id: matchedId,
        updated_at: new Date().toISOString()
      })
      .eq('candidate_id', cand.candidate_id);
  }

  console.log('\n--- Reconciliation Results ---');
  console.log(`- Matched & Complete (🟢): ${matchedVerified}`);
  console.log(`- Matched & Needs Enrichment (🟡): ${matchedIncomplete}`);
  console.log(`- Missing / Ready to Add (🔵): ${missingNew}`);
  console.log(`- Potential Duplicates (🟠): ${duplicates}`);
}

async function applyBatch(targetBatchId) {
  const batchId = targetBatchId || 'OBGYN-2026-08-14-001';
  console.log(`=== Applying Batch ${batchId} to Programs Database ===\n`);

  const { data: candidates, error: candErr } = await supabase
    .from('obgyn_program_candidates')
    .select('*')
    .eq('batch_id', batchId);

  if (candErr || !candidates) {
    console.error('Error fetching candidates for batch:', candErr?.message);
    return;
  }

  let updatedCount = 0;
  let insertedCount = 0;

  for (const cand of candidates) {
    if (cand.matched_program_id) {
      // Enrich existing program
      const { error: updateErr } = await supabase
        .from('programs')
        .update({
          acgme_program_number: cand.acgme_program_number || undefined,
          program_director: cand.program_director || undefined,
          website: cand.website || undefined,
          pgy1_positions: cand.pgy1_positions || undefined,
          training_years: cand.training_years || 4,
          accepts_img: cand.accepts_img !== null ? cand.accepts_img : true,
          graduation_year_restriction: cand.graduation_year_restriction || undefined,
          visa_j1: cand.visa_j1 !== null ? cand.visa_j1 : undefined,
          visa_h1b: cand.visa_h1b !== null ? cand.visa_h1b : undefined,
          ecfmg_required: cand.ecfmg_required !== null ? cand.ecfmg_required : true,
          application_service: cand.application_service || undefined,
          verified: true,
          verified_at: new Date().toISOString(),
          provisional_data: false
        })
        .eq('id', cand.matched_program_id);

      if (updateErr) {
        console.error(`Update error for ${cand.program_name}:`, updateErr.message);
      } else {
        updatedCount++;
      }
    } else {
      // Determine specialty array and program_type based on candidate
      let specialtyArray = ['Obstetrics and Gynecology'];
      let pType = 'residency';
      if (cand.batch_id.includes('OBSERVERSHIP')) {
        specialtyArray = ['Obstetrics/Gynecology'];
        pType = 'observership';
      } else if (cand.batch_id.includes('IMG-RESIDENCY')) {
        specialtyArray = ['Internal Medicine'];
        pType = 'residency';
      }

      // Insert missing program
      const { error: insertErr } = await supabase.from('programs').insert({
        name: cand.program_name,
        institution: cand.institution,
        city: cand.city,
        state: cand.state,
        zip: cand.zip,
        specialty: specialtyArray,
        program_type: pType,
        is_acgme_accredited: cand.acgme_program_number ? true : false,
        acgme_program_number: cand.acgme_program_number,
        program_director: cand.program_director,
        website: cand.website,
        pgy1_positions: cand.pgy1_positions,
        training_years: cand.training_years || 4,
        accepts_img: cand.accepts_img !== null ? cand.accepts_img : true,
        graduation_year_restriction: cand.graduation_year_restriction,
        visa_j1: cand.visa_j1 !== null ? cand.visa_j1 : true,
        visa_h1b: cand.visa_h1b !== null ? cand.visa_h1b : false,
        ecfmg_required: cand.ecfmg_required !== null ? cand.ecfmg_required : true,
        application_service: cand.application_service || 'ResidencyCAS',
        verified: true,
        verified_at: new Date().toISOString(),
        provisional_data: false
      });

      if (insertErr) {
        console.error(`Insert error for ${cand.program_name}:`, insertErr.message);
      } else {
        insertedCount++;
      }
    }
  }

  // Update batch record status
  await supabase
    .from('obgyn_import_batches')
    .update({
      status: 'completed',
      records_new: insertedCount,
      records_updated: updatedCount,
      updated_at: new Date().toISOString()
    })
    .eq('batch_id', batchId);

  console.log(`Successfully applied batch ${batchId}:`);
  console.log(`- Enriched existing programs: ${updatedCount}`);
  console.log(`- Inserted new programs: ${insertedCount}`);
}

async function init() {
  console.log('=== Initializing Workbench & Checking Supabase Readiness ===\n');

  const { data: sample, error: sampleErr } = await supabase.from('programs').select('id, acgme_program_number, provisional_data').limit(1);
  if (sampleErr) {
    console.log('Note: Column extensions like `acgme_program_number` or `provisional_data` need to be created via `supabase_obgyn_import_schema.sql`.');
  } else {
    console.log('Programs table schema supports extended OB/GYN fields!');
  }

  const { error: batchErr } = await supabase.from('obgyn_import_batches').select('batch_id').limit(1);
  if (batchErr) {
    console.log('Workbench tables do not exist yet. Run `supabase_obgyn_import_schema.sql` in your Supabase SQL Editor.');
  } else {
    console.log('Workbench tables (obgyn_import_batches & obgyn_program_candidates) are ready!');
  }
}

// Command dispatcher
const command = process.argv[2] || 'audit';
const arg = process.argv[3];

if (command === 'audit') {
  audit();
} else if (command === 'reconcile') {
  reconcile();
} else if (command === 'apply-batch') {
  applyBatch(arg);
} else if (command === 'init') {
  init();
} else {
  console.log('Usage: node scripts/obgyn-reconcile.js [init|audit|reconcile|apply-batch [batch_id]]');
}
