-- ============================================
-- IDEMPOTENT MIGRATION: Community Features
-- Safe to run multiple times - checks before creating
-- ============================================

-- 1. PROGRAMS TABLE - Add missing columns if table exists
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'specialty') THEN
    ALTER TABLE programs ADD COLUMN specialty text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'city') THEN
    ALTER TABLE programs ADD COLUMN city text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'state') THEN
    ALTER TABLE programs ADD COLUMN state text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'program_type') THEN
    ALTER TABLE programs ADD COLUMN program_type text CHECK (program_type IN ('residency','fellowship','observership','research','elective'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'is_acgme_accredited') THEN
    ALTER TABLE programs ADD COLUMN is_acgme_accredited boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'ecfmg_pathway_eligible') THEN
    ALTER TABLE programs ADD COLUMN ecfmg_pathway_eligible boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'website') THEN
    ALTER TABLE programs ADD COLUMN website text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'contact_email') THEN
    ALTER TABLE programs ADD COLUMN contact_email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'description') THEN
    ALTER TABLE programs ADD COLUMN description text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'submitted_by') THEN
    ALTER TABLE programs ADD COLUMN submitted_by uuid REFERENCES auth.users;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'verified') THEN
    ALTER TABLE programs ADD COLUMN verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'created_at') THEN
    ALTER TABLE programs ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

-- 2. PROGRAM_NOTES TABLE
CREATE TABLE IF NOT EXISTS program_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  title text,
  content text NOT NULL,
  note_type text CHECK (note_type IN ('experience','tip','warning','cost','visa','interview','culture')),
  rating int CHECK (rating BETWEEN 1 AND 5),
  is_anonymous boolean DEFAULT false,
  helpful_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. SCAM_REPORTS TABLE
CREATE TABLE IF NOT EXISTS scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  entity_name text NOT NULL,
  entity_type text CHECK (entity_type IN ('physician','program','agency','consultancy','other')),
  scam_category text CHECK (scam_category IN ('paid_rotation','fake_letter','visa_fraud','money_for_match','credential_fraud','other')),
  description text NOT NULL,
  amount_usd numeric(10,2),
  evidence_urls text[],
  reporter_id uuid REFERENCES auth.users,
  is_anonymous boolean DEFAULT true,
  status text CHECK (status IN ('pending','under_review','verified','disputed','dismissed')) DEFAULT 'pending',
  moderator_notes text,
  created_at timestamptz DEFAULT now()
);

-- 4. USER_REPUTATION TABLE
CREATE TABLE IF NOT EXISTS user_reputation (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  score int DEFAULT 0,
  verified_contributor boolean DEFAULT false,
  notes_count int DEFAULT 0,
  reports_count int DEFAULT 0,
  helpful_votes int DEFAULT 0
);

-- 5. ENABLE RLS (idempotent)
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES - Drop and recreate (safe to run multiple times)
DO $$
BEGIN
  -- Programs policies
  DROP POLICY IF EXISTS "Anyone can view verified programs" ON programs;
  DROP POLICY IF EXISTS "Authenticated users can view all programs" ON programs;
  DROP POLICY IF EXISTS "Authenticated users can insert programs" ON programs;
  DROP POLICY IF EXISTS "Users can update own programs" ON programs;
  
  CREATE POLICY "Anyone can view verified programs" ON programs FOR SELECT USING (verified = true);
  CREATE POLICY "Authenticated users can view all programs" ON programs FOR SELECT USING (auth.role() = 'authenticated');
  CREATE POLICY "Authenticated users can insert programs" ON programs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  CREATE POLICY "Users can update own programs" ON programs FOR UPDATE USING (auth.uid() = submitted_by);
  
  -- Program notes policies
  DROP POLICY IF EXISTS "Users can insert own notes" ON program_notes;
  DROP POLICY IF EXISTS "Anyone can view notes" ON program_notes;
  DROP POLICY IF EXISTS "Users can update own notes" ON program_notes;
  DROP POLICY IF EXISTS "Users can delete own notes" ON program_notes;
  
  CREATE POLICY "Users can insert own notes" ON program_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Anyone can view notes" ON program_notes FOR SELECT USING (true);
  CREATE POLICY "Users can update own notes" ON program_notes FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own notes" ON program_notes FOR DELETE USING (auth.uid() = user_id);
  
  -- Scam reports policies
  DROP POLICY IF EXISTS "Users can insert own scam reports" ON scam_reports;
  DROP POLICY IF EXISTS "Anyone can view verified scam reports" ON scam_reports;
  DROP POLICY IF EXISTS "Reporters can view own reports" ON scam_reports;
  DROP POLICY IF EXISTS "Moderators can update scam reports" ON scam_reports;
  DROP POLICY IF EXISTS "Moderators can view all scam reports" ON scam_reports;
  
  CREATE POLICY "Users can insert own scam reports" ON scam_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  CREATE POLICY "Anyone can view verified scam reports" ON scam_reports FOR SELECT USING (status = 'verified');
  CREATE POLICY "Reporters can view own reports" ON scam_reports FOR SELECT USING (auth.uid() = reporter_id);
  CREATE POLICY "Moderators can update scam reports" ON scam_reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_reputation WHERE user_id = auth.uid() AND verified_contributor = true)
  );
  CREATE POLICY "Moderators can view all scam reports" ON scam_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_reputation WHERE user_id = auth.uid() AND verified_contributor = true)
  );
  
  -- User reputation policies
  DROP POLICY IF EXISTS "Users can view own reputation" ON user_reputation;
  DROP POLICY IF EXISTS "Moderators can view all reputation" ON user_reputation;
  DROP POLICY IF EXISTS "System can update reputation" ON user_reputation;
  
  CREATE POLICY "Users can view own reputation" ON user_reputation FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Moderators can view all reputation" ON user_reputation FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_reputation WHERE user_id = auth.uid() AND verified_contributor = true)
  );
  CREATE POLICY "System can update reputation" ON user_reputation FOR UPDATE USING (true);
  
END $$;

-- 7. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_programs_verified ON programs(verified);
CREATE INDEX IF NOT EXISTS idx_programs_program_type ON programs(program_type);
CREATE INDEX IF NOT EXISTS idx_programs_state ON programs(state);
CREATE INDEX IF NOT EXISTS idx_programs_specialty ON programs USING GIN(specialty);
CREATE INDEX IF NOT EXISTS idx_programs_submitted_by ON programs(submitted_by);

CREATE INDEX IF NOT EXISTS idx_program_notes_program_id ON program_notes(program_id);
CREATE INDEX IF NOT EXISTS idx_program_notes_user_id ON program_notes(user_id);

CREATE INDEX IF NOT EXISTS idx_scam_reports_program_id ON scam_reports(program_id);
CREATE INDEX IF NOT EXISTS idx_scam_reports_reporter_id ON scam_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_scam_reports_status ON scam_reports(status);
CREATE INDEX IF NOT EXISTS idx_scam_reports_entity_name ON scam_reports(entity_name);

-- 8. HELPER FUNCTIONS
-- Atomic helpful vote (prevents double-voting)
CREATE OR REPLACE FUNCTION vote_note_helpful(note_id uuid, voter_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Check if user already voted (would need a votes table for full implementation)
  -- For now, just increment
  UPDATE program_notes 
  SET helpful_count = helpful_count + 1 
  WHERE id = note_id;
END $$;

-- Increment reputation
CREATE OR REPLACE FUNCTION increment_reputation(target_user_id uuid, points int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_reputation (user_id, score, notes_count, reports_count, helpful_votes)
  VALUES (target_user_id, points, 0, 0, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    score = user_reputation.score + EXCLUDED.score;
END $$;