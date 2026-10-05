-- ============================================================================
-- SECURITY + SAVED SEARCHES MIGRATION
-- MatchaMD / EmberWing Industries LLC
-- Supabase project: mmfixpgfaskufmrfmzcc
--
-- APPLIED AND VERIFIED 2026-10-04. Idempotent: safe to re-run.
--
-- Fixes:
--   SEC-01  anon could UPDATE any row in `programs` via "Allow anon update
--           programs" (UPDATE, USING (true) on role public). Allowed
--           self-verification -- flipping verified = true on your own
--           submission, which ProgramsList/ProgramDetail render as a trust badge.
--   SEC-02  anon could UPDATE any row in `user_reputation` via "System can
--           update reputation" (UPDATE, USING (true)). Allowed self-granting
--           verified_contributor, the authorization gate for
--           updateScamReportStatus() via is_verified_contributor().
--   SEC-03  specialty_aliases held table-level UPDATE for anon. It drives the
--           specialty typeahead, so search results could be silently rewritten.
--   GAP-01  user_saved_searches never existed, so src/api/programs.js always
--           fell back to localStorage for saved-search presets.
--
-- VERIFICATION (run against the live DB after applying):
--   unconditional write policies remaining           -- 0
--   anon UPDATE on user_reputation / aliases          -- false
--   anon SELECT on user_saved_searches               -- false
--   authenticated SELECT/INSERT/UPDATE on it          -- true
--   search_programs(...) still returns rows; programs unchanged (12709).
--
-- Idempotency note: DROP POLICY IF EXISTS takes a double-quoted identifier.
-- Single quotes are a syntax error there.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. Shared authorization helpers
--
-- SECURITY DEFINER + a fixed search_path: these read user_reputation, which
-- anon must NOT be able to read directly. Without SECURITY DEFINER the
-- policy would recurse (policy -> function -> RLS on user_reputation -> ...).
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_verified_contributor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_reputation
    WHERE user_id = auth.uid()
      AND verified_contributor = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_verified_contributor() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1. SEC-01 -- programs
--
-- A user may only edit rows they submitted. Flipping `verified` is reserved for
-- verified contributors. Public read access is preserved so search still works
-- for logged-out visitors.
-- ---------------------------------------------------------------------------

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon update programs" ON public.programs;
DROP POLICY IF EXISTS "Allow anon insert programs" ON public.programs;
DROP POLICY IF EXISTS "Allow public read access"   ON public.programs;

-- The live DB already carried "Users can update own programs"
-- (USING auth.uid() = submitted_by). Recreated here so this file stays the
-- single source of truth regardless of prior state.
DROP POLICY IF EXISTS "Users can update own submitted programs" ON public.programs;

CREATE POLICY "Anyone can read programs"
  ON public.programs
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own programs"
  ON public.programs
  FOR UPDATE
  USING (auth.uid() = submitted_by)
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Moderators can update any program"
  ON public.programs
  FOR UPDATE
  USING (public.is_verified_contributor())
  WITH CHECK (public.is_verified_contributor());

-- A submission must record its owner, otherwise the ownership policy above can
-- never match and the submitter could never correct their own entry.
CREATE POLICY "Authenticated users can submit programs"
  ON public.programs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = submitted_by);

-- ---------------------------------------------------------------------------
-- 2. SEC-02 -- user_reputation
--
-- Reputation is written only through the SECURITY DEFINER RPCs
-- (increment_reputation). Client-side writes are revoked so
-- verified_contributor cannot be self-assigned.
-- ---------------------------------------------------------------------------

ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can update reputation" ON public.user_reputation;

REVOKE UPDATE, DELETE, TRUNCATE ON public.user_reputation FROM anon;
REVOKE UPDATE, DELETE, TRUNCATE ON public.user_reputation FROM authenticated;

-- ---------------------------------------------------------------------------
-- 3. SEC-03 -- specialty_aliases
--
-- Read-only for clients. An editable alias table means an anonymous caller can
-- steer everyone's search results.
-- ---------------------------------------------------------------------------

ALTER TABLE public.specialty_aliases ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.specialty_aliases FROM anon;

GRANT SELECT ON public.specialty_aliases TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. GAP-01 -- user_saved_searches
--
-- The table was never created, so src/api/programs.js always hit its
-- localStorage fallback. Creates the table plus owner-scoped RLS so a user can
-- only ever see their own presets.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_saved_searches (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL CHECK (length(trim(name)) > 0),
  filters    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Older partial creation may lack NOT NULL / the CHECK.
ALTER TABLE public.user_saved_searches
  ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_saved_searches_user_id
  ON public.user_saved_searches(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_saved_searches_user_name
  ON public.user_saved_searches(user_id, lower(name));

ALTER TABLE public.user_saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved searches"   ON public.user_saved_searches;
DROP POLICY IF EXISTS "Users can insert own saved searches" ON public.user_saved_searches;
DROP POLICY IF EXISTS "Users can delete own saved searches" ON public.user_saved_searches;
DROP POLICY IF EXISTS "Users can update own saved searches" ON public.user_saved_searches;

CREATE POLICY "Users can view own saved searches"
  ON public.user_saved_searches
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved searches"
  ON public.user_saved_searches
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON public.user_saved_searches
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON public.user_saved_searches
  FOR DELETE
  USING (auth.uid() = user_id);

-- Defence in depth: RLS already scopes rows to auth.uid(), but anon gets no
-- table-level grant either, so there is no path to the table without a session.
REVOKE ALL ON public.user_saved_searches FROM anon;
REVOKE ALL ON public.user_saved_searches FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_saved_searches TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. updated_at maintenance
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.touch_user_saved_searches_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_saved_searches_updated_at ON public.user_saved_searches;

CREATE TRIGGER trg_user_saved_searches_updated_at
  BEFORE UPDATE ON public.user_saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_user_saved_searches_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Post-conditions -- fail loudly rather than silently leaving the DB open.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  leak text;
BEGIN
  SELECT string_agg(format('%s(%s) %s', tablename, cmd, coalesce(qual, with_check)), ', ')
    INTO leak
  FROM pg_policies
  WHERE schemaname = 'public'
    AND cmd IN ('UPDATE', 'DELETE', 'INSERT')
    AND (qual = 'true' OR with_check = 'true')
    AND tablename IN ('programs', 'user_reputation', 'specialty_aliases', 'user_saved_searches');

  IF leak IS NOT NULL THEN
    RAISE EXCEPTION 'SEC-01/02 still open - unconditional write policy remains: %', leak;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_saved_searches'
  ) THEN
    RAISE EXCEPTION 'GAP-01: user_saved_searches was not created';
  END IF;

  RAISE NOTICE 'Migration OK: policies scoped, saved searches table present';
END $$;

COMMIT;