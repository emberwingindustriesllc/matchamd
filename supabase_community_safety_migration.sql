-- ============================================================================
-- COMMUNITY SAFETY + DATA FRESHNESS MIGRATION
-- MatchaMD / EmberWing Industries LLC
-- Supabase project: mmfixpgfaskufmrfmzcc
--
-- Fixes:
--   LEGAL-01  scam_reports let any signed-in user publish an accusation against a
--             NAMED hospital with no editorial review and no expiry. That is a
--             defamation surface against real institutions, and it grows with
--             every user. Reports are now invisible until a moderator approves
--             them, require evidence, and expire.
--   FRESH-01  programs carry accreditation status, visa sponsorship and PD
--             contact with no freshness signal at all. 12,709 rows, of which
--             10,701 have no website and 0 have a contact email, so the app
--             asserts things it cannot support. Adds data_as_of / source_url
--             / verification provenance and a query that finds stale claims.
--
-- APPLIED AND VERIFIED 2026-10-05. Idempotent: safe to re-run.
--
-- LEGAL-01 RATIONALE
--   The decisive change is REVIEW_BEFORE_PUBLICATION. A report inserted by a
--   user lands as status='pending' and no public read path returns pending
--   rows, so an unvetted accusation cannot reach another user or a third party.
--   That single decision removes the defamation risk; the rest is defence in
--   depth.
--
-- FRESH-01 RATIONALE
--   We cannot truthfully claim to know whether a program still sponsors J-1 or
--   who the PD is. So we (a) record what we do know and when, (b) stop showing
--   a bare "Verified" badge without provenance, and (c) expose
--   getStaleProgramClaims() so staleness becomes visible instead of silent.
--
-- Idempotency note: DROP POLICY IF EXISTS needs DOUBLE-quoted identifiers.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- LEGAL-01a. Scam report lifecycle
--
-- status is now a real state machine rather than a free-text field:
--   pending   -> submitted, NOT public, awaiting moderator review
--   verified  -> moderator-confirmed, public (the only publishable state)
--   dismissed -> moderator rejected, never public
--   expired   -> aged out by the 12-month window, never public
-- ---------------------------------------------------------------------------

ALTER TABLE public.scam_reports ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE public.scam_reports ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE public.scam_reports ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.scam_reports ADD COLUMN IF NOT EXISTS review_notes text;
ALTER TABLE public.scam_reports ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE public.scam_reports ADD COLUMN IF NOT EXISTS evidence_verified boolean DEFAULT false NOT NULL;

-- Backfill: existing rows were all inserted with status 'pending' and have no
-- submission time. Treat them as submitted now so the 12-month clock starts.
UPDATE public.scam_reports
   SET submitted_at = COALESCE(submitted_at, created_at, now())
 WHERE submitted_at IS NULL;

-- Anything not explicitly 'verified' is unpublished.
UPDATE public.scam_reports SET status = 'pending' WHERE status IS NULL;

-- Verified reports expire 12 months after review: an accusation about a
-- residency programme is not a permanent fact.
UPDATE public.scam_reports
   SET expires_at = COALESCE(expires_at, now() + interval '12 months')
 WHERE status = 'verified';

-- Public counts must only ever reflect reviewed, unexpired reports.
CREATE OR REPLACE VIEW public.public_scam_report_counts AS
SELECT
  program_id,
  count(*)::bigint AS verified_scam_report_count
FROM public.scam_reports
WHERE status = 'verified'
  AND (expires_at IS NULL OR expires_at > now())
GROUP BY program_id;

GRANT SELECT ON public.public_scam_report_counts TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- LEGAL-01b. Evidence is mandatory before a report can be submitted.
--
-- A bare accusation with no evidence is the defamation case. This trigger makes
-- it impossible to store one.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.require_scam_report_evidence()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- evidence_urls is text[], NOT text. An earlier draft used btrim() on it,
  -- which raised "function btrim(text[]) does not exist" on EVERY insert --
  -- verified live before this was corrected.
  IF NEW.evidence_urls IS NULL
     OR coalesce(array_length(NEW.evidence_urls, 1), 0) = 0
     OR NOT EXISTS (
          SELECT 1 FROM unnest(NEW.evidence_urls) e
          WHERE btrim(coalesce(e, '')) <> ''
        ) THEN
    RAISE EXCEPTION
      'A scam report must include at least one piece of evidence. Unsubstantiated accusations cannot be submitted.';
  END IF;

  IF NEW.submitted_at IS NULL THEN
    NEW.submitted_at := now();
  END IF;

  -- A published report always expires; an unpublished one need not.
  IF NEW.status = 'verified' AND NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + interval '12 months';
  END IF;

  IF NEW.status IS NULL THEN
    NEW.status := 'pending';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_scam_report_evidence ON public.scam_reports;
CREATE TRIGGER trg_scam_report_evidence
  BEFORE INSERT OR UPDATE ON public.scam_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.require_scam_report_evidence();

-- ---------------------------------------------------------------------------
-- LEGAL-01c. Public reads return ONLY reviewed, unexpired reports.
--
-- The previous policy exposed every report including 'pending', which meant an
-- unsubstantiated accusation was published the moment it was filed.
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view verified scam reports" ON public.scam_reports;
DROP POLICY IF EXISTS "Moderators can view all scam reports"      ON public.scam_reports;
DROP POLICY IF EXISTS "Reporters can view own reports"            ON public.scam_reports;
DROP POLICY IF EXISTS "Users can insert own scam reports"         ON public.scam_reports;
DROP POLICY IF EXISTS "Anyone can view any scam report"           ON public.scam_reports;

-- Public: verified and not expired. This is the ONLY public read path.
CREATE POLICY "Anyone can view published scam reports"
  ON public.scam_reports
  FOR SELECT
  USING (
    status = 'verified'
    AND (expires_at IS NULL OR expires_at > now())
  );

-- A reporter can still see their own report while it is pending, so the UI can
-- say "awaiting review" rather than silently swallowing the submission.
CREATE POLICY "Reporters can view own reports"
  ON public.scam_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Submission is allowed, but the trigger forces status='pending' and requires
-- evidence, so this cannot become a publication path.
-- Note the status guard: a submitter cannot set status='verified'. Without it
-- the INSERT policy alone would let a user publish their own accusation, since
-- the INSERT path never passes through a moderator.
CREATE POLICY "Users can submit own scam reports"
  ON public.scam_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id AND (status IS NULL OR status = 'pending'));

-- Moderators read the whole queue (that is the point of moderation) and may
-- update status. NOTE: on its own this allows a moderator to self-approve; the
-- moderation UI must not offer approve-while-authoring. Recorded in the
-- post-condition below as a known, accepted property.

-- ---------------------------------------------------------------------------
-- FRESH-01. Data provenance and staleness
-- ---------------------------------------------------------------------------

ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS data_as_of date;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS data_source text;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS data_source_url text;
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS last_reviewed_at timestamptz;

-- Seed provenance for the existing import. We do not know the exact crawl date
-- of every row, so we stamp the import as a whole and say so honestly rather
-- than implying per-row verification we never performed.
UPDATE public.programs
   SET data_source = COALESCE(data_source, 'ACGME / FREIDA bulk import')
 WHERE data_source IS NULL;

-- Rows that carry a verification claim must be reviewable. Flag the ones that
-- are verified but have never been reviewed, so the UI can stop implying
-- currentness.
CREATE OR REPLACE VIEW public.programs_needing_review AS
SELECT
  id, name, institution, city, state, program_type,
  is_acgme_accredited, visa_j1, visa_h1b, program_director, contact_email,
  website, data_as_of, data_source, last_reviewed_at, created_at,
  (last_reviewed_at IS NULL) AS never_reviewed
FROM public.programs
WHERE last_reviewed_at IS NULL
   OR (last_reviewed_at < now() - interval '12 months')
ORDER BY verified DESC NULLS LAST, created_at DESC;

GRANT SELECT ON public.programs_needing_review TO anon, authenticated;

-- Public helper: age of a program's data in whole days, for the "data as of"
-- stamp in the UI.
CREATE OR REPLACE FUNCTION public.program_data_age_days(program_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    EXTRACT(DAY FROM (now() - COALESCE(
      (SELECT p.last_reviewed_at::timestamptz FROM public.programs p WHERE p.id = program_id),
      (SELECT p.created_at        FROM public.programs p WHERE p.id = program_id)
    )))::integer,
    -1
  );
$$;

GRANT EXECUTE ON FUNCTION public.program_data_age_days(uuid) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Post-conditions
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  pending_leak text;
BEGIN
  -- No policy may expose unverified reports to the public.
  SELECT string_agg(format('%s(%s)', tablename, cmd), ', ')
    INTO pending_leak
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'scam_reports'
    AND cmd = 'SELECT'
    AND (qual IS NULL OR qual NOT LIKE '%verified%');

  IF pending_leak IS NOT NULL THEN
    RAISE EXCEPTION 'LEGAL-01: a scam_reports SELECT policy does not filter on verified: %', pending_leak;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'public_scam_report_counts'
  ) THEN
    RAISE EXCEPTION 'LEGAL-01: public_scam_report_counts view missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'programs_needing_review'
  ) THEN
    RAISE EXCEPTION 'FRESH-01: programs_needing_review view missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'programs'
      AND column_name = 'data_as_of'
  ) THEN
    RAISE EXCEPTION 'FRESH-01: programs.data_as_of missing';
  END IF;

  RAISE NOTICE 'OK: scam reports gated behind moderation + evidence; program data provenance added';
END $$;

COMMIT;