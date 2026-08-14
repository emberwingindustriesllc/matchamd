-- ============================================================
-- IDEMPOTENT MIGRATION: Persistent OB/GYN Import & Reconciliation
-- MatchAMD Database Workbench
-- ============================================================

-- 1. EXTEND PROGRAMS TABLE WITH DETAILED RESIDENCY & IMG FIELDS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'acgme_program_number') THEN
    ALTER TABLE programs ADD COLUMN acgme_program_number text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'program_director') THEN
    ALTER TABLE programs ADD COLUMN program_director text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'pgy1_positions') THEN
    ALTER TABLE programs ADD COLUMN pgy1_positions integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'training_years') THEN
    ALTER TABLE programs ADD COLUMN training_years integer DEFAULT 4;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'accepts_img') THEN
    ALTER TABLE programs ADD COLUMN accepts_img boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'graduation_year_restriction') THEN
    ALTER TABLE programs ADD COLUMN graduation_year_restriction integer; -- e.g. 4 for <= 4 years
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'ecfmg_required') THEN
    ALTER TABLE programs ADD COLUMN ecfmg_required boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'application_service') THEN
    ALTER TABLE programs ADD COLUMN application_service text; -- e.g., 'ResidencyCAS', 'ERAS'
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'application_deadline') THEN
    ALTER TABLE programs ADD COLUMN application_deadline text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'verified_at') THEN
    ALTER TABLE programs ADD COLUMN verified_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'provisional_data') THEN
    ALTER TABLE programs ADD COLUMN provisional_data boolean DEFAULT false;
  END IF;
END $$;

-- 2. CREATE OBGYN_IMPORT_BATCHES TABLE
CREATE TABLE IF NOT EXISTS obgyn_import_batches (
  batch_id text PRIMARY KEY,
  source text NOT NULL,
  source_date date DEFAULT CURRENT_DATE,
  status text CHECK (status IN ('pending', 'staging', 'reconciling', 'importing', 'completed', 'failed')) DEFAULT 'pending',
  records_found integer DEFAULT 0,
  records_new integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_duplicate integer DEFAULT 0,
  records_rejected integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. CREATE OBGYN_PROGRAM_CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS obgyn_program_candidates (
  candidate_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id text REFERENCES obgyn_import_batches(batch_id) ON DELETE CASCADE,
  acgme_program_number text,
  program_name text NOT NULL,
  institution text,
  city text,
  state text,
  zip text,
  website text,
  program_director text,
  pgy1_positions integer,
  training_years integer DEFAULT 4,
  accepts_img boolean,
  graduation_year_restriction integer,
  visa_j1 boolean,
  visa_h1b boolean,
  ecfmg_required boolean,
  application_service text,
  application_deadline text,
  source text NOT NULL,
  source_url text,
  verification_status text CHECK (verification_status IN ('pending', 'matched_verified', 'matched_incomplete', 'missing_new', 'duplicate', 'needs_investigation')) DEFAULT 'pending',
  matched_program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  notes text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. ENABLE RLS AND POLICIES FOR BENCH TABLES & PROGRAMS IMPORT
ALTER TABLE obgyn_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE obgyn_program_candidates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow anon select batches" ON obgyn_import_batches;
  DROP POLICY IF EXISTS "Allow anon all batches" ON obgyn_import_batches;
  CREATE POLICY "Allow anon all batches" ON obgyn_import_batches FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow anon select candidates" ON obgyn_program_candidates;
  DROP POLICY IF EXISTS "Allow anon all candidates" ON obgyn_program_candidates;
  CREATE POLICY "Allow anon all candidates" ON obgyn_program_candidates FOR ALL USING (true) WITH CHECK (true);

  -- Allow program insertion/update for verified program imports
  DROP POLICY IF EXISTS "Allow anon insert programs" ON programs;
  CREATE POLICY "Allow anon insert programs" ON programs FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow anon update programs" ON programs;
  CREATE POLICY "Allow anon update programs" ON programs FOR UPDATE USING (true);
END $$;

-- 6. INDEXES FOR FAST RECONCILIATION
CREATE INDEX IF NOT EXISTS idx_programs_acgme_no ON programs(acgme_program_number);
CREATE INDEX IF NOT EXISTS idx_candidates_acgme_no ON obgyn_program_candidates(acgme_program_number);
CREATE INDEX IF NOT EXISTS idx_candidates_batch_id ON obgyn_program_candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_candidates_verification_status ON obgyn_program_candidates(verification_status);

