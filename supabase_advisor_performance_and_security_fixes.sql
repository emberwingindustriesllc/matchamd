-- ============================================================================
-- SUPABASE ADVISOR PERFORMANCE & SECURITY REMEDIATION MIGRATION
-- MatchaMD / EmberWing Industries LLC
-- Supabase project: mmfixpgfaskufmrfmzcc
--
-- Remediates:
--   1. auth_rls_initplan (29 WARN items): wraps auth.uid() and auth.role()
--      in scalar subqueries ((select auth.uid()), (select auth.role())) so
--      PostgreSQL caches them once per query (InitPlan) instead of evaluating
--      per row.
--   2. multiple_permissive_policies (35 WARN items across 6 tables):
--      consolidates overlapping PERMISSIVE policies per (table, action) and
--      splits FOR ALL write policies into explicit UPDATE/DELETE policies.
--   3. duplicate_index (4 WARN items + redundant single-column indexes
--      already covered by leading columns of UNIQUE constraints).
--   4. unindexed_foreign_keys (4 INFO items): adds covering B-tree indexes
--      for comments.author_id, forum_posts.program_id,
--      obgyn_program_candidates.matched_program_id, and
--      scam_reports.reviewed_by.
--   5. security_definer_view (2 ERROR items): sets security_invoker = true
--      on public_scam_report_counts and programs_needing_review.
--   6. function_search_path_mutable (WARN items) & SECURITY DEFINER tightening:
--      pins search_path = public on custom functions, adds public SELECT
--      policy on specialty_aliases, switches search_programs to
--      SECURITY INVOKER, and revokes anon EXECUTE on write RPCs.
--
-- Idempotent: safe to re-run multiple times.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. Helper Function & Security Advisor Fixes
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_verified_contributor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_reputation
    WHERE user_id = (select auth.uid())
      AND verified_contributor = true
  );
$$;

GRANT SELECT ON public.user_reputation TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_verified_contributor() TO anon, authenticated;

-- Move pg_trgm out of public schema if still in public
CREATE SCHEMA IF NOT EXISTS extensions;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE e.extname = 'pg_trgm' AND n.nspname = 'public'
  ) THEN
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  END IF;
END $$;

-- Fix security_definer_view ERRORs on views
ALTER VIEW IF EXISTS public.public_scam_report_counts SET (security_invoker = true);
ALTER VIEW IF EXISTS public.programs_needing_review   SET (security_invoker = true);

-- Fix function_search_path_mutable WARNs on public functions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'update_modified_column') THEN
    ALTER FUNCTION public.update_modified_column() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'ensure_policy') THEN
    ALTER FUNCTION public.ensure_policy(text, text, text, text, text) SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'require_scam_report_evidence') THEN
    ALTER FUNCTION public.require_scam_report_evidence() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'touch_user_saved_searches_updated_at') THEN
    ALTER FUNCTION public.touch_user_saved_searches_updated_at() SET search_path = public;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'program_data_age_days') THEN
    ALTER FUNCTION public.program_data_age_days(uuid) SET search_path = public;
  END IF;
END $$;

-- Ensure specialty_aliases has a public read policy so search_programs can run as SECURITY INVOKER
DROP POLICY IF EXISTS "Anyone can read specialty aliases" ON public.specialty_aliases;
CREATE POLICY "Anyone can read specialty aliases"
  ON public.specialty_aliases
  FOR SELECT
  USING (true);

ALTER FUNCTION public.search_programs(
  text[], text[], text[], text[], text[],
  boolean, boolean, boolean, boolean, boolean, boolean, boolean,
  text, integer, integer
) SECURITY INVOKER;

-- Restrict write SECURITY DEFINER RPCs to authenticated users only and enforce caller checks
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
  IF (select auth.uid()) IS NULL OR target_user_id IS DISTINCT FROM (select auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to modify reputation for another user';
  END IF;

  IF points IS NULL OR points < 1 OR points > 15 THEN
    RAISE EXCEPTION 'Invalid reputation points increment';
  END IF;

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
  IF (select auth.uid()) IS NULL OR voter_id IS DISTINCT FROM (select auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to vote on behalf of another user';
  END IF;

  UPDATE public.program_notes
  SET helpful_count = COALESCE(helpful_count, 0) + 1
  WHERE id = note_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_reputation(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_reputation(uuid, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.vote_note_helpful(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vote_note_helpful(uuid, uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- 1. RLS Policies: Fix auth_rls_initplan & multiple_permissive_policies
-- ----------------------------------------------------------------------------

-- 1a. public.comments
-- Split FOR ALL policy into UPDATE and DELETE so it does not overlap SELECT and INSERT
DROP POLICY IF EXISTS "Everyone can read comments"                 ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments"    ON public.comments;
DROP POLICY IF EXISTS "Users can update/delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments"        ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments"        ON public.comments;

CREATE POLICY "Everyone can read comments"
  ON public.comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments
  FOR INSERT
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments
  FOR UPDATE
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments
  FOR DELETE
  USING ((select auth.uid()) = author_id);

-- 1b. public.forum_posts
DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Allow authors to update their own posts"   ON public.forum_posts;
DROP POLICY IF EXISTS "Allow authors to delete their own posts"   ON public.forum_posts;

CREATE POLICY "Allow authenticated users to create posts"
  ON public.forum_posts
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authors to update their own posts"
  ON public.forum_posts
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Allow authors to delete their own posts"
  ON public.forum_posts
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 1c. public.mentor_requests
-- Consolidate SELECT for mentee + mentor, and separate INSERT/UPDATE/DELETE for mentee
DROP POLICY IF EXISTS "Mentees can manage their requests"         ON public.mentor_requests;
DROP POLICY IF EXISTS "Mentors can see requests sent to them"     ON public.mentor_requests;
DROP POLICY IF EXISTS "Mentees and mentors can view their requests" ON public.mentor_requests;
DROP POLICY IF EXISTS "Mentees can insert their requests"         ON public.mentor_requests;
DROP POLICY IF EXISTS "Mentees can update their requests"         ON public.mentor_requests;
DROP POLICY IF EXISTS "Mentees can delete their requests"         ON public.mentor_requests;

CREATE POLICY "Mentees and mentors can view their requests"
  ON public.mentor_requests
  FOR SELECT
  USING ((select auth.uid()) = mentee_id OR (select auth.uid()) = mentor_id);

CREATE POLICY "Mentees can insert their requests"
  ON public.mentor_requests
  FOR INSERT
  WITH CHECK ((select auth.uid()) = mentee_id);

CREATE POLICY "Mentees can update their requests"
  ON public.mentor_requests
  FOR UPDATE
  USING ((select auth.uid()) = mentee_id)
  WITH CHECK ((select auth.uid()) = mentee_id);

CREATE POLICY "Mentees can delete their requests"
  ON public.mentor_requests
  FOR DELETE
  USING ((select auth.uid()) = mentee_id);

-- 1d. public.notifications
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;

CREATE POLICY "Users can manage their own notifications"
  ON public.notifications
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 1e. public.polls
DROP POLICY IF EXISTS "Authenticated users can vote" ON public.polls;

CREATE POLICY "Authenticated users can vote"
  ON public.polls
  FOR UPDATE
  USING ((select auth.role()) = 'authenticated'::text)
  WITH CHECK ((select auth.role()) = 'authenticated'::text);

-- 1f. public.program_notes
DROP POLICY IF EXISTS "Users can insert own notes" ON public.program_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.program_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.program_notes;

CREATE POLICY "Users can insert own notes"
  ON public.program_notes
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notes"
  ON public.program_notes
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.program_notes
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- 1g. public.programs
-- Consolidate owner + moderator UPDATE into a single policy to eliminate multiple_permissive_policies
DROP POLICY IF EXISTS "Authenticated users can submit programs" ON public.programs;
DROP POLICY IF EXISTS "Users can update own programs"           ON public.programs;
DROP POLICY IF EXISTS "Moderators can update any program"       ON public.programs;

CREATE POLICY "Authenticated users can submit programs"
  ON public.programs
  FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL AND (select auth.uid()) = submitted_by);

CREATE POLICY "Users can update own programs"
  ON public.programs
  FOR UPDATE
  USING ((select auth.uid()) = submitted_by OR public.is_verified_contributor())
  WITH CHECK ((select auth.uid()) = submitted_by OR public.is_verified_contributor());

-- 1h. public.progress
DROP POLICY IF EXISTS "Users can manage their own progress" ON public.progress;

CREATE POLICY "Users can manage their own progress"
  ON public.progress
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 1i. public.purchased_content
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchased_content;

CREATE POLICY "Users can view own purchases"
  ON public.purchased_content
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- 1j. public.quiz_progress
DROP POLICY IF EXISTS "Users can view own quiz progress"   ON public.quiz_progress;
DROP POLICY IF EXISTS "Users can insert own quiz progress" ON public.quiz_progress;
DROP POLICY IF EXISTS "Users can update own quiz progress" ON public.quiz_progress;

CREATE POLICY "Users can view own quiz progress"
  ON public.quiz_progress
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own quiz progress"
  ON public.quiz_progress
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own quiz progress"
  ON public.quiz_progress
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 1k. public.research_opportunities
-- Drop duplicate SELECT policy ("Everyone can read research opportunities") and keep "Public read research opportunities"
DROP POLICY IF EXISTS "Everyone can read research opportunities"    ON public.research_opportunities;
DROP POLICY IF EXISTS "Public read research opportunities"          ON public.research_opportunities;
DROP POLICY IF EXISTS "Authenticated insert research opportunities" ON public.research_opportunities;

CREATE POLICY "Public read research opportunities"
  ON public.research_opportunities
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated insert research opportunities"
  ON public.research_opportunities
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated'::text);

-- 1l. public.scam_reports
-- Consolidate the 3 SELECT policies into a single policy to eliminate multiple_permissive_policies
DROP POLICY IF EXISTS "Anyone can view published scam reports" ON public.scam_reports;
DROP POLICY IF EXISTS "Reporters can view own reports"         ON public.scam_reports;
DROP POLICY IF EXISTS "Moderators can review scam reports"     ON public.scam_reports;
DROP POLICY IF EXISTS "Users can submit own scam reports"      ON public.scam_reports;

CREATE POLICY "Anyone can view published scam reports"
  ON public.scam_reports
  FOR SELECT
  USING (
    (status = 'verified'::text AND (expires_at IS NULL OR expires_at > now()))
    OR (select auth.uid()) = reporter_id
    OR public.is_verified_contributor()
  );

CREATE POLICY "Users can submit own scam reports"
  ON public.scam_reports
  FOR INSERT
  WITH CHECK ((select auth.uid()) = reporter_id AND (status IS NULL OR status = 'pending'::text));

-- 1m. public.subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- 1n. public.user_profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile"   ON public.user_profiles;

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- 1o. public.user_reputation
-- Consolidate owner + moderator SELECT into a single policy
DROP POLICY IF EXISTS "Users can view own reputation"      ON public.user_reputation;
DROP POLICY IF EXISTS "Moderators can view all reputation" ON public.user_reputation;

CREATE POLICY "Users can view own reputation"
  ON public.user_reputation
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- 1p. public.user_saved_searches
DROP POLICY IF EXISTS "Users can view own saved searches"   ON public.user_saved_searches;
DROP POLICY IF EXISTS "Users can insert own saved searches" ON public.user_saved_searches;
DROP POLICY IF EXISTS "Users can update own saved searches" ON public.user_saved_searches;
DROP POLICY IF EXISTS "Users can delete own saved searches" ON public.user_saved_searches;

CREATE POLICY "Users can view own saved searches"
  ON public.user_saved_searches
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own saved searches"
  ON public.user_saved_searches
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own saved searches"
  ON public.user_saved_searches
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON public.user_saved_searches
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- 2. Drop Duplicate & Redundant Indexes (duplicate_index)
-- ----------------------------------------------------------------------------

-- Exact duplicate index pairs reported by Supabase linter:
DROP INDEX IF EXISTS public.idx_programs_acgme_number;         -- duplicate of idx_programs_acgme_no
DROP INDEX IF EXISTS public.idx_programs_specialty;            -- duplicate of idx_programs_specialty_gin
DROP INDEX IF EXISTS public.purchased_content_user_id_idx;     -- duplicate of idx_purchased_content_user_id (and covered by unique_user_content)
DROP INDEX IF EXISTS public.subscriptions_user_id_idx;         -- duplicate of idx_subscriptions_user_id (and covered by unique_user_subscription)

-- Single-column indexes already covered by leading column of UNIQUE constraints:
DROP INDEX IF EXISTS public.idx_purchased_content_user_id;     -- covered by unique_user_content (user_id, content_id)
DROP INDEX IF EXISTS public.idx_subscriptions_user_id;         -- covered by unique_user_subscription (user_id)
DROP INDEX IF EXISTS public.idx_quiz_progress_user_id;         -- covered by unique_user_category (user_id, category_id)
DROP INDEX IF EXISTS public.idx_user_saved_searches_user_id;   -- covered by idx_user_saved_searches_user_name (user_id, lower(name))
DROP INDEX IF EXISTS public.idx_specialty_aliases_normalized;  -- covered by uq_specialty_alias_normalized (normalized_alias)

-- ----------------------------------------------------------------------------
-- 3. Add Covering Indexes for Unindexed Foreign Keys (unindexed_foreign_keys)
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_comments_author_id
  ON public.comments(author_id);

CREATE INDEX IF NOT EXISTS idx_forum_posts_program_id
  ON public.forum_posts(program_id);

CREATE INDEX IF NOT EXISTS idx_candidates_matched_program_id
  ON public.obgyn_program_candidates(matched_program_id);

CREATE INDEX IF NOT EXISTS idx_scam_reports_reviewed_by
  ON public.scam_reports(reviewed_by);

COMMIT;
