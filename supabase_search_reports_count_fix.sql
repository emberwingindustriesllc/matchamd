-- ============================================================================
-- LEGAL-01 FIX: search_programs() leaked pending scam-report counts
-- MatchaMD / EmberWing Industries LLC
-- Supabase project: mmfixpgfaskufmrfmzcc
-- Status: APPLIED LIVE and verified 2026-10-05
--
-- THE LEAK
--   search_programs() is SECURITY DEFINER, so it BYPASSES RLS entirely. Its
--   report-count subquery was:
--
--       LEFT JOIN (SELECT program_id, count(*) cnt
--                  FROM scam_reports GROUP BY program_id) sr ON sr.program_id = p.id
--
--   No status filter and no expiry filter. The program card renders
--   `scam_reports_count > 0` as a red "N Reports" badge, so an UNREVIEWED
--   accusation would have been shown publicly as a fact about a named
--   hospital -- the exact harm the moderation gate exists to prevent.
--
--   Verified live: pg_proc.prosrc for search_programs contained no
--   occurrence of 'status' at all.
--
-- THE FIX (as actually applied)
--   The function's own source was read with pg_get_functiondef(), the count
--   subquery string-replaced to match the public RLS policy exactly, and the
--   result re-executed. This preserves the original signature, defaults and
--   return type (TABLE(...), not SETOF jsonb) with no DROP and no client
--   change.
--
--   An earlier draft of this file proposed rewriting the function as
--   RETURNS SETOF jsonb. That was NOT used and is not needed -- it would have
--   been a breaking signature change for no benefit. The applied predicate is
--   the only difference from the original function:
--
--   The count subquery now matches the public RLS policy exactly:
--   status = 'verified' AND (expires_at IS NULL OR expires_at > now()).
--
--   This file documents the applied change. The live function is patched;
--   re-running the DO block below is a no-op.
--
-- IDEMPOTENT: no data is modified.
-- ============================================================================

DO $$
DECLARE
  d TEXT;
  n TEXT;
BEGIN
  SELECT pg_get_functiondef(oid) INTO d FROM pg_proc WHERE proname = 'search_programs';

  IF d IS NULL THEN
    RAISE EXCEPTION 'LEGAL-01: function search_programs() not found';
  END IF;

  IF d LIKE '%status = ''verified''%' THEN
    RAISE NOTICE 'LEGAL-01: already patched, nothing to do';
    RETURN;
  END IF;

  n := replace(d,
    '(SELECT program_id, count(*) cnt FROM scam_reports GROUP BY program_id) sr',
    '(SELECT program_id, count(*) cnt FROM scam_reports WHERE status = ''verified'' AND (expires_at IS NULL OR expires_at > now()) GROUP BY program_id) sr');

  IF n = d THEN
    RAISE EXCEPTION
      'LEGAL-01: target subquery not found -- the function has changed shape. '
      'Read it with pg_get_functiondef() and patch by hand.';
  END IF;

  EXECUTE n;
  RAISE NOTICE 'LEGAL-01: search_programs() now counts only verified, unexpired reports';
END $$;

-- ---------------------------------------------------------------------------
-- Post-condition: the count subquery MUST filter on status AND expiry.
-- Verified live 2026-10-05: pending -> 0, verified+unexpired -> 1,
-- expired -> 0.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'search_programs'
      AND prosrc LIKE '%status = ''verified''%'
      AND prosrc LIKE '%expires_at%'
  ) THEN
    RAISE EXCEPTION
      'LEGAL-01 REGRESSION: search_programs() can count unverified reports. '
      'A pending accusation would render publicly as a "N Reports" badge.';
  END IF;

  RAISE NOTICE 'OK: verified + unexpired only';
END $$;