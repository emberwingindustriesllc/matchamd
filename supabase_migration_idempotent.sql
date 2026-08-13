-- ============================================================
-- MATCHAMD COMMUNITY FEATURES MIGRATION
-- ============================================================
-- Safe to run multiple times.
--
-- IMPORTANT:
-- The program_type constraint is intentionally created as
-- NOT VALID because existing programs may contain legacy
-- program_type values.
-- ============================================================


-- ============================================================
-- 1. PROGRAMS TABLE - ADD MISSING COLUMNS
-- ============================================================

DO $$
BEGIN

  -- specialty
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'specialty'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN specialty text[];
  END IF;


  -- city
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'city'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN city text;
  END IF;


  -- state
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'state'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN state text;
  END IF;


  -- ACGME accreditation
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'is_acgme_accredited'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN is_acgme_accredited boolean DEFAULT false;
  END IF;


  -- ECFMG pathway eligibility
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'ecfmg_pathway_eligible'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN ecfmg_pathway_eligible boolean DEFAULT false;
  END IF;


  -- website
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'website'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN website text;
  END IF;


  -- contact email
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'contact_email'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN contact_email text;
  END IF;


  -- description
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'description'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN description text;
  END IF;


  -- submitted_by
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'submitted_by'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN submitted_by uuid
      REFERENCES auth.users(id);
  END IF;


  -- verified
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'verified'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN verified boolean DEFAULT false;
  END IF;


  -- created_at
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programs'
      AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.programs
      ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

END
$$;


-- ============================================================
-- 2. PROGRAM TYPE CONSTRAINT
-- ============================================================
-- Existing data may contain legacy values.
-- NOT VALID allows the migration to proceed without
-- modifying existing records.
--
-- New/updated rows ARE still required to satisfy this check.
-- ============================================================

ALTER TABLE public.programs
  DROP CONSTRAINT IF EXISTS programs_program_type_check;


ALTER TABLE public.programs
  ADD CONSTRAINT programs_program_type_check
  CHECK (
    program_type IN (
      'residency',
      'fellowship',
      'observership',
      'research',
      'elective',
      'medical_school'
    )
  )
  NOT VALID;


-- ============================================================
-- 3. PROGRAM NOTES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.program_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  program_id uuid
    REFERENCES public.programs(id)
    ON DELETE CASCADE,

  user_id uuid
    REFERENCES auth.users(id),

  title text,

  content text NOT NULL,

  note_type text
    CHECK (
      note_type IN (
        'experience',
        'tip',
        'warning',
        'cost',
        'visa',
        'interview',
        'culture'
      )
    ),

  rating int
    CHECK (rating BETWEEN 1 AND 5),

  is_anonymous boolean DEFAULT false,

  helpful_count int DEFAULT 0,

  created_at timestamptz DEFAULT now()
);


-- ============================================================
-- 4. SCAM REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  program_id uuid
    REFERENCES public.programs(id)
    ON DELETE SET NULL,

  entity_name text NOT NULL,

  entity_type text
    CHECK (
      entity_type IN (
        'physician',
        'program',
        'agency',
        'consultancy',
        'other'
      )
    ),

  scam_category text
    CHECK (
      scam_category IN (
        'paid_rotation',
        'fake_letter',
        'visa_fraud',
        'money_for_match',
        'credential_fraud',
        'other'
      )
    ),

  description text NOT NULL,

  amount_usd numeric(10,2),

  evidence_urls text[],

  reporter_id uuid
    REFERENCES auth.users(id),

  is_anonymous boolean DEFAULT true,

  status text
    CHECK (
      status IN (
        'pending',
        'under_review',
        'verified',
        'disputed',
        'dismissed'
      )
    )
    DEFAULT 'pending',

  moderator_notes text,

  created_at timestamptz DEFAULT now()
);


-- ============================================================
-- 5. USER REPUTATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_reputation (
  user_id uuid PRIMARY KEY
    REFERENCES auth.users(id),

  score int DEFAULT 0,

  verified_contributor boolean DEFAULT false,

  notes_count int DEFAULT 0,

  reports_count int DEFAULT 0,

  helpful_votes int DEFAULT 0
);


-- ============================================================
-- 6. RESEARCH OPPORTUNITIES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.research_opportunities (
  id text PRIMARY KEY
    DEFAULT gen_random_uuid()::text,

  title text NOT NULL,

  institution text NOT NULL,

  specialty text,

  city text,

  state text,

  compensation text
    CHECK (
      compensation IN (
        'unpaid',
        'stipend',
        'paid'
      )
    ),

  remote_allowed boolean DEFAULT false,

  positions_available int DEFAULT 1,

  duration text,

  description text NOT NULL,

  requirements text[],

  contact_email text NOT NULL,

  application_deadline date,

  status text DEFAULT 'open',

  tags text[],

  submitted_by uuid
    REFERENCES auth.users(id),

  created_at timestamptz DEFAULT now()
);


-- ============================================================
-- 7. QUIZ PROGRESS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid
    REFERENCES auth.users(id)
    NOT NULL,

  category_id text NOT NULL,

  questions_answered int DEFAULT 0,

  questions_correct int DEFAULT 0,

  last_updated timestamptz DEFAULT now(),

  CONSTRAINT unique_user_category
    UNIQUE (user_id, category_id)
);


-- ============================================================
-- 8. SUBSCRIPTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  plan text NOT NULL DEFAULT 'free',

  status text NOT NULL DEFAULT 'active',

  stripe_customer_id text,

  stripe_subscription_id text,

  current_period_start timestamptz,

  current_period_end timestamptz,

  cancel_at_period_end boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),

  CONSTRAINT unique_user_subscription
    UNIQUE (user_id)
);


-- ============================================================
-- 9. PURCHASED CONTENT
-- ============================================================

CREATE TABLE IF NOT EXISTS public.purchased_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  content_type text NOT NULL DEFAULT 'unknown',

  content_id text NOT NULL DEFAULT 'unknown',

  price numeric(10,2) NOT NULL DEFAULT 0.00,

  stripe_payment_id text,

  purchased_at timestamptz DEFAULT now(),

  CONSTRAINT unique_user_content
    UNIQUE (user_id, content_id)
);


-- ============================================================
-- 10. HELPER FUNCTION - MODERATOR CHECK
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_verified_contributor()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_reputation
    WHERE user_id = auth.uid()
      AND verified_contributor = true
  );
$$;


-- ============================================================
-- 11. PROGRAM POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view verified programs"
  ON public.programs;

DROP POLICY IF EXISTS "Authenticated users can view all programs"
  ON public.programs;

DROP POLICY IF EXISTS "Authenticated users can insert programs"
  ON public.programs;

DROP POLICY IF EXISTS "Users can update own programs"
  ON public.programs;


CREATE POLICY "Anyone can view verified programs"
ON public.programs
FOR SELECT
USING (
  verified = true
);


CREATE POLICY "Authenticated users can view all programs"
ON public.programs
FOR SELECT
USING (
  auth.role() = 'authenticated'
);


CREATE POLICY "Authenticated users can insert programs"
ON public.programs
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);


CREATE POLICY "Users can update own programs"
ON public.programs
FOR UPDATE
USING (
  auth.uid() = submitted_by
)
WITH CHECK (
  auth.uid() = submitted_by
);


-- ============================================================
-- 12. PROGRAM NOTES POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own notes"
  ON public.program_notes;

DROP POLICY IF EXISTS "Anyone can view notes"
  ON public.program_notes;

DROP POLICY IF EXISTS "Users can update own notes"
  ON public.program_notes;

DROP POLICY IF EXISTS "Users can delete own notes"
  ON public.program_notes;


CREATE POLICY "Users can insert own notes"
ON public.program_notes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);


CREATE POLICY "Anyone can view notes"
ON public.program_notes
FOR SELECT
USING (true);


CREATE POLICY "Users can update own notes"
ON public.program_notes
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);


CREATE POLICY "Users can delete own notes"
ON public.program_notes
FOR DELETE
USING (
  auth.uid() = user_id
);


-- ============================================================
-- 13. SCAM REPORT POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can insert own scam reports"
  ON public.scam_reports;

DROP POLICY IF EXISTS "Anyone can view verified scam reports"
  ON public.scam_reports;

DROP POLICY IF EXISTS "Reporters can view own reports"
  ON public.scam_reports;

DROP POLICY IF EXISTS "Moderators can update scam reports"
  ON public.scam_reports;

DROP POLICY IF EXISTS "Moderators can view all scam reports"
  ON public.scam_reports;


CREATE POLICY "Users can insert own scam reports"
ON public.scam_reports
FOR INSERT
WITH CHECK (
  auth.uid() = reporter_id
);


CREATE POLICY "Anyone can view verified scam reports"
ON public.scam_reports
FOR SELECT
USING (
  status = 'verified'
);


CREATE POLICY "Reporters can view own reports"
ON public.scam_reports
FOR SELECT
USING (
  auth.uid() = reporter_id
);


CREATE POLICY "Moderators can update scam reports"
ON public.scam_reports
FOR UPDATE
USING (
  public.is_verified_contributor()
);


CREATE POLICY "Moderators can view all scam reports"
ON public.scam_reports
FOR SELECT
USING (
  public.is_verified_contributor()
);


-- ============================================================
-- 14. USER REPUTATION POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own reputation"
  ON public.user_reputation;

DROP POLICY IF EXISTS "Moderators can view all reputation"
  ON public.user_reputation;

DROP POLICY IF EXISTS "System can update reputation"
  ON public.user_reputation;


CREATE POLICY "Users can view own reputation"
ON public.user_reputation
FOR SELECT
USING (
  auth.uid() = user_id
);


CREATE POLICY "Moderators can view all reputation"
ON public.user_reputation
FOR SELECT
USING (
  public.is_verified_contributor()
);


CREATE POLICY "System can update reputation"
ON public.user_reputation
FOR UPDATE
USING (true)
WITH CHECK (true);


-- ============================================================
-- 15. RESEARCH OPPORTUNITY POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Public read research opportunities"
  ON public.research_opportunities;

DROP POLICY IF EXISTS "Authenticated insert research opportunities"
  ON public.research_opportunities;


CREATE POLICY "Public read research opportunities"
ON public.research_opportunities
FOR SELECT
USING (true);


CREATE POLICY "Authenticated insert research opportunities"
ON public.research_opportunities
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);


-- ============================================================
-- 16. QUIZ PROGRESS POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own quiz progress"
  ON public.quiz_progress;

DROP POLICY IF EXISTS "Users can insert own quiz progress"
  ON public.quiz_progress;

DROP POLICY IF EXISTS "Users can update own quiz progress"
  ON public.quiz_progress;


CREATE POLICY "Users can view own quiz progress"
ON public.quiz_progress
FOR SELECT
USING (
  auth.uid() = user_id
);


CREATE POLICY "Users can insert own quiz progress"
ON public.quiz_progress
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);


CREATE POLICY "Users can update own quiz progress"
ON public.quiz_progress
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);


-- ============================================================
-- 17. SUBSCRIPTION POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own subscription"
  ON public.subscriptions;

DROP POLICY IF EXISTS "Users can insert own subscription"
  ON public.subscriptions;

DROP POLICY IF EXISTS "Users can update own subscription"
  ON public.subscriptions;


CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
USING (
  auth.uid() = user_id
);


CREATE POLICY "Users can insert own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);


CREATE POLICY "Users can update own subscription"
ON public.subscriptions
FOR UPDATE
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);


-- ============================================================
-- 18. PURCHASED CONTENT POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own purchases"
  ON public.purchased_content;

DROP POLICY IF EXISTS "Users can insert own purchases"
  ON public.purchased_content;


CREATE POLICY "Users can view own purchases"
ON public.purchased_content
FOR SELECT
USING (
  auth.uid() = user_id
);


CREATE POLICY "Users can insert own purchases"
ON public.purchased_content
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);


-- ============================================================
-- 19. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_programs_verified
  ON public.programs(verified);

CREATE INDEX IF NOT EXISTS idx_programs_program_type
  ON public.programs(program_type);

CREATE INDEX IF NOT EXISTS idx_programs_state
  ON public.programs(state);

CREATE INDEX IF NOT EXISTS idx_programs_specialty
  ON public.programs USING GIN(specialty);

CREATE INDEX IF NOT EXISTS idx_programs_submitted_by
  ON public.programs(submitted_by);


CREATE INDEX IF NOT EXISTS idx_program_notes_program_id
  ON public.program_notes(program_id);

CREATE INDEX IF NOT EXISTS idx_program_notes_user_id
  ON public.program_notes(user_id);


CREATE INDEX IF NOT EXISTS idx_scam_reports_program_id
  ON public.scam_reports(program_id);

CREATE INDEX IF NOT EXISTS idx_scam_reports_reporter_id
  ON public.scam_reports(reporter_id);

CREATE INDEX IF NOT EXISTS idx_scam_reports_status
  ON public.scam_reports(status);

CREATE INDEX IF NOT EXISTS idx_scam_reports_entity_name
  ON public.scam_reports(entity_name);


CREATE INDEX IF NOT EXISTS idx_research_opportunities_specialty
  ON public.research_opportunities(specialty);

CREATE INDEX IF NOT EXISTS idx_research_opportunities_state
  ON public.research_opportunities(state);

CREATE INDEX IF NOT EXISTS idx_research_opportunities_status
  ON public.research_opportunities(status);


CREATE INDEX IF NOT EXISTS idx_quiz_progress_user_id
  ON public.quiz_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_purchased_content_user_id
  ON public.purchased_content(user_id);


-- ============================================================
-- 20. HELPER FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.vote_note_helpful(
  note_id uuid,
  voter_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.program_notes
  SET helpful_count = COALESCE(helpful_count, 0) + 1
  WHERE id = note_id;
END;
$$;


CREATE OR REPLACE FUNCTION public.increment_reputation(
  target_user_id uuid,
  points int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_reputation (
    user_id,
    score,
    notes_count,
    reports_count,
    helpful_votes
  )
  VALUES (
    target_user_id,
    points,
    0,
    0,
    0
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    score = public.user_reputation.score + EXCLUDED.score;
END;
$$;


-- ============================================================
-- 21. FUNCTION PERMISSIONS
-- ============================================================

REVOKE ALL
ON FUNCTION public.is_verified_contributor()
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.is_verified_contributor()
TO authenticated;


REVOKE ALL
ON FUNCTION public.vote_note_helpful(uuid, uuid)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.vote_note_helpful(uuid, uuid)
TO authenticated;


REVOKE ALL
ON FUNCTION public.increment_reputation(uuid, int)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.increment_reputation(uuid, int)
TO authenticated;


-- ============================================================
-- 22. ENABLE ROW LEVEL SECURITY (AFTER all policies exist)
-- ============================================================
-- This must be last: enabling RLS before policies would lock
-- everyone out of the tables.
-- ============================================================

ALTER TABLE public.programs
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.program_notes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.scam_reports
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_reputation
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.research_opportunities
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.quiz_progress
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.subscriptions
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.purchased_content
  ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 23. MIGRATION COMPLETE
-- ============================================================