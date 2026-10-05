-- ============================================================================
-- NOTE AUTHOR DENORMALIZATION MIGRATION
-- MatchaMD / EmberWing Industries LLC
-- Supabase project: mmfixpgfaskufmrfmzcc
--
-- APPLIES CLEANLY 2026-10-05. Idempotent: safe to re-run.
--
-- WHAT
--   Adds `author_display_name text` to `program_notes` and `scam_reports`.
--
-- WHY
--   ProgramNoteCard.jsx / ScamReportCard.jsx render the author from
--   `note.user.user_metadata.display_name`, which requires a
--   `user:auth.users(...)` embed. That embed needs elevated privileges and
--   fails under the anon key, so fetchProgramNotes() fell back to
--   `select('*')` -- which means there is no `user` object at all and every
--   community note renders as "Unknown".
--
--   Joining auth.users from the client is not an option: auth.users is not
--   readable through PostgREST with the anon key, and re-granting that read
--   path would leak every user's email and metadata to anonymous visitors.
--   So the name is copied onto the row at write time instead, where the
--   authenticated session already knows it.
--
--   This is deliberately denormalized: the name is a snapshot taken when the
--   note is written. A later profile rename does not rewrite history, which is
--   the normal behavior for a community post anyway.
--
-- PRIVACY
--   `is_anonymous` is the whole point of these tables, so anonymous rows are
--   left NULL both by the backfill below and by createProgramNote() on the
--   client. The cards render "Anonymous" from the flag, never from this
--   column, so a stale non-null value cannot leak a name on an anonymous row.
--
-- VERIFICATION (run against the live DB after applying):
--   program_notes.author_display_name exists        -- true
--   scam_reports.author_display_name exists         -- true
--   anon INSERT/UPDATE/DELETE policy count on both  -- 0 (unchanged)
--   rows where is_anonymous AND author_display_name IS NOT NULL -- 0
--   program_notes / scam_reports row counts         -- unchanged
--
-- Idempotency note: DROP POLICY IF EXISTS takes a double-quoted identifier.
-- Single quotes are a syntax error there. No policies are created or dropped
-- in this file -- the new column is nullable, so existing SELECT/INSERT
-- policies keep working untouched, and adding a write policy here would risk
-- granting anon write access to user-submitted content.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Columns
--
-- Nullable, no default: existing rows stay valid and the column is simply
-- NULL until the backfill below fills it in.
-- ---------------------------------------------------------------------------

ALTER TABLE public.program_notes
  ADD COLUMN IF NOT EXISTS author_display_name text;

ALTER TABLE public.scam_reports
  ADD COLUMN IF NOT EXISTS author_display_name text;

-- ---------------------------------------------------------------------------
-- 2. Backfill
--
-- Reads auth.users, which this script can do because it runs as the table
-- owner in the SQL editor / migration runner. The client never can, which is
-- the entire reason this column exists.
--
-- Name resolution order, matching what the cards used to read out of
-- user_metadata: user_profiles.display_name first (the app's own profile),
-- then the auth metadata display_name, then the email local part. Anonymous
-- rows are excluded outright.
--
-- No-op today (0 rows in both tables) but correct, so the file stays safe to
-- apply to any environment with data.
-- ---------------------------------------------------------------------------

UPDATE public.program_notes n
   SET author_display_name = coalesce(
         NULLIF(trim(p.display_name), ''),
         NULLIF(trim(u.raw_user_meta_data ->> 'display_name'), ''),
         split_part(u.email, '@', 1)
       )
  FROM auth.users u
  LEFT JOIN public.user_profiles p
    ON p.user_id = u.id
 WHERE n.user_id = u.id
   AND n.is_anonymous IS NOT TRUE
   AND n.author_display_name IS NULL
   AND coalesce(
         NULLIF(trim(p.display_name), ''),
         NULLIF(trim(u.raw_user_meta_data ->> 'display_name'), ''),
         split_part(u.email, '@', 1)
       ) IS NOT NULL;

UPDATE public.scam_reports r
   SET author_display_name = coalesce(
         NULLIF(trim(p.display_name), ''),
         NULLIF(trim(u.raw_user_meta_data ->> 'display_name'), ''),
         split_part(u.email, '@', 1)
       )
  FROM auth.users u
  LEFT JOIN public.user_profiles p
    ON p.user_id = u.id
 WHERE r.reporter_id = u.id
   AND r.is_anonymous IS NOT TRUE
   AND r.author_display_name IS NULL
   AND coalesce(
         NULLIF(trim(p.display_name), ''),
         NULLIF(trim(u.raw_user_meta_data ->> 'display_name'), ''),
         split_part(u.email, '@', 1)
       ) IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Post-conditions -- fail loudly instead of leaving notes reading
--    "Unknown" because the column silently did not exist.
--
-- Deliberately no index on author_display_name: nothing sorts or filters by
-- it. Cards only render it, and an unused index on a text column is write
-- amplification on the community's hottest write path for nothing.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  missing text;
  leak   text;
BEGIN
  SELECT string_agg(t, ', ')
    INTO missing
    FROM unnest(ARRAY['program_notes', 'scam_reports']) AS t
   WHERE NOT EXISTS (
     SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = t
       AND column_name = 'author_display_name'
       AND data_type = 'text'
   );

  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'author_display_name missing from: %', missing;
  END IF;

  -- Anonymity guard: no anonymous row may carry a name.
  IF EXISTS (
    SELECT 1 FROM public.program_notes
     WHERE is_anonymous IS TRUE AND author_display_name IS NOT NULL
    UNION ALL
    SELECT 1 FROM public.scam_reports
     WHERE is_anonymous IS TRUE AND author_display_name IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'is_anonymous row carries author_display_name - anonymity leak';
  END IF;

  -- Adding a column must not have widened write access on user content.
  SELECT string_agg(format('%s(%s) %s', tablename, cmd, coalesce(qual, with_check)), ', ')
    INTO leak
    FROM pg_policies
   WHERE schemaname = 'public'
     AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
     AND (qual = 'true' OR with_check = 'true')
     AND tablename IN ('program_notes', 'scam_reports');

  IF leak IS NOT NULL THEN
    RAISE EXCEPTION 'unconditional write policy on note tables: %', leak;
  END IF;

  RAISE NOTICE 'Migration OK: author_display_name present on program_notes and scam_reports';
END $$;

COMMIT;
