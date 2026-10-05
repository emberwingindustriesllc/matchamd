-- ============================================================================
-- SEC-06 + POLICY-DEDUP
-- MatchaMD / EmberWing Industries LLC
-- Supabase project: mmfixpgfaskufmrfmzcc
-- Status: APPLIED LIVE and verified 2026-10-05
-- ============================================================================
--
-- WHY THIS FILE EXISTS
--   A fix that looks correct in isolation can be silently defeated by a
--   second, older policy on the same table. PostgreSQL ORs PERMISSIVE
--   policies together for a given command, so a permissive policy granting
--   broader access wins over a tighter one. Both of the issues below were
--   found by querying pg_policies after the earlier hardening pass -- not by
--   reading the code.
--
-- ----------------------------------------------------------------------------
-- SEC-06: OB/GYN import staging tables were fully writable by anon
-- ----------------------------------------------------------------------------
--   Both tables carried `FOR ALL TO anon USING (true) WITH CHECK (true)`
--   (policies "Allow anon all batches" / "Allow anon all candidates") on top
--   of full table grants to the anon role:
--
--       INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
--
--   That is unauthenticated INSERT/UPDATE/DELETE -- including TRUNCATE -- on
--   public tables reachable with the publishable key alone.
--
--   Neither table is referenced anywhere in src/ or supabase/; they are
--   internal import staging for the OB/GYN program import. No app role needs
--   access, so access was removed rather than narrowed.
--
--   Applied:
--     DROP POLICY "Allow anon all batches"    ON obgyn_import_batches
--     DROP POLICY "Allow anon all candidates" ON obgyn_program_candidates
--     REVOKE ALL ... FROM anon, authenticated   (both tables)
--     ALTER TABLE ... ENABLE ROW LEVEL SECURITY (both, explicit)
--
--   Verified live: relrowsecurity = true, zero policies, zero grants to anon
--   or authenticated. Rows preserved (5 batches, 38 candidates).
--
-- ----------------------------------------------------------------------------
-- POLICY-DEDUP: a weaker INSERT policy was defeating the owner-scoped one
-- ----------------------------------------------------------------------------
--   `programs` had TWO permissive INSERT policies:
--
--     "Authenticated users can insert programs"  WITH CHECK (auth.role() = 'authenticated')
--     "Authenticated users can submit programs"  WITH CHECK (auth.uid() IS NOT NULL
--                                                          AND auth.uid() = submitted_by)
--
--   Permissive policies OR together, so the first -- satisfied by ANY logged
--   in user, with no binding to submitted_by -- was the effective rule. The
--   owner-scoped check added in the earlier hardening pass was therefore
--   never in force: a signed-in user could attribute a submission to someone
--   else.
--
--   `programs` also carried four overlapping SELECT policies, three of which
--   were redundant against "Anyone can read programs" USING (true). They were
--   collapsed to one canonical policy so the next reader does not have to
--   reason about precedence.
--
--   Applied: DROP the weaker INSERT policy and the three redundant SELECT
--   policies. Final `programs` policy set is exactly:
--     SELECT  "Anyone can read programs"      USING (true)
--     INSERT  "Authenticated users can submit programs"
--             WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = submitted_by)
--     UPDATE  "Users can update own programs"  USING/WITH CHECK (auth.uid() = submitted_by)
--     UPDATE  "Moderators can update any program"  USING/WITH CHECK is_verified_contributor()
--
--   Verified live: 12,709 programs still anon-readable; 0 policies anywhere
--   in the schema grant unconditional INSERT/UPDATE/DELETE.
--
-- NOTE ON THE REMAINING MULTI-POLICY SETS (reviewed, left alone)
--   research_opportunities SELECT x2 -- both are public read; harmless.
--   scam_reports SELECT x3          -- owner OR moderator OR published-verified.
--                                      Deliberate: the submitter must see their
--                                      own pending report to track it.
--   user_reputation SELECT x2       -- own row OR moderator. Deliberate.
--   programs UPDATE x2              -- owner OR moderator. Deliberate.
--   None of these grants broader WRITE access than intended.
-- ============================================================================

-- Re-runnable: safe to apply again.
DROP POLICY IF EXISTS "Allow anon all batches"    ON public.obgyn_import_batches;
DROP POLICY IF EXISTS "Allow anon all candidates" ON public.obgyn_program_candidates;

REVOKE ALL ON public.obgyn_import_batches    FROM anon, authenticated;
REVOKE ALL ON public.obgyn_program_candidates FROM anon, authenticated;

ALTER TABLE public.obgyn_import_batches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obgyn_program_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert programs" ON public.programs;
DROP POLICY IF EXISTS "Anyone can search programs"              ON public.programs;
DROP POLICY IF EXISTS "Anyone can view verified programs"       ON public.programs;
DROP POLICY IF EXISTS "Authenticated users can view all programs" ON public.programs;

-- Post-condition guard: no policy in the schema may grant unconditional
-- write access. This is the check that would have caught SEC-06 immediately.
DO $$
DECLARE n INTEGER;
BEGIN
  SELECT count(*) INTO n
  FROM pg_policies
  WHERE schemaname = 'public'
    AND cmd IN ('ALL', 'INSERT', 'UPDATE', 'DELETE')
    AND (qual = 'true' OR with_check = 'true');

  IF n > 0 THEN
    RAISE EXCEPTION
      'SEC-06 REGRESSION: % policy/policies grant unconditional write access', n;
  END IF;

  RAISE NOTICE 'OK: no unconditional write policies remain';
END $$;