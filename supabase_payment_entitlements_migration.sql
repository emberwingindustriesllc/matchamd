-- ============================================================================
-- SEC-04 -- PAYMENT ENTITLEMENTS ARE WEBHOOK-ONLY
-- MatchaMD / EmberWing Industries LLC
-- Supabase project: mmfixpgfaskufmrfmzcc
--
-- APPLIED AND VERIFIED 2026-10-04. Idempotent: safe to re-run.
--
-- PROBLEM
-- Two privilege-escalation holes let any logged-in user grant themselves paid
-- access for free, with no payment involved:
--
--   1. purchased_content had "Users can insert own purchases"
--      (INSERT WITH CHECK auth.uid() = user_id). A user could POST their own
--      row with content_id = 'interview_premium' / 'quiz_usmle' /
--      'specialty_surgery' and immediately satisfy the entitlement check in
--      InterviewCourse.jsx / USMLEQuizPack.jsx / SurgeryGuide.jsx:
--          purchases.some(p => p.content_id === 'interview_premium')
--      Those tables were the ENTIRE basis of paid access. There is no server
--      side verification of the payment.
--
--   2. purchased_content had "Users can manage their purchases" (FOR ALL) and
--      subscriptions had "Users can manage their subscriptions" (FOR ALL),
--      each USING (auth.uid() = user_id). FOR ALL covers UPDATE and DELETE, so
--      a user could delete their own rows (silently revoking a real paying
--      customer's access) or rewrite the plan column.
--
-- FIX
-- Both tables are now read-only from the client. Writes happen only through the
-- Stripe webhook Edge Function, which connects with SUPABASE_SERVICE_ROLE_KEY
-- and therefore bypasses RLS entirely. Verified in
-- supabase/functions/stripeWebhook/index.ts: every insert/update to
-- purchased_content and subscriptions there uses `supabaseService`.
--
-- The app has no legitimate client-side write path to either table.
--
-- VERIFICATION (run against the live DB after applying):
--   has_table_privilege('authenticated','public.purchased_content','INSERT') -- false
--   has_table_privilege('authenticated','public.subscriptions','UPDATE')     -- false
--   has_table_privilege('authenticated','public.purchased_content','SELECT') -- true
--   has_table_privilege('authenticated','public.subscriptions','SELECT')     -- true
--   unconditional write policies across the whole schema                      -- 0
--   purchased_content 6 rows, subscriptions 2 rows, programs 12709 (unchanged)
--
-- NOTE: this does NOT by itself make the paywalls secure. The client still
-- resolves entitlement from localStorage and from this table. It closes the
-- self-grant path; see issue #3 for the remaining client-side trust problem.
--
-- Idempotency note: DROP POLICY IF EXISTS requires a DOUBLE-quoted identifier.
-- Single quotes are a syntax error there.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. purchased_content -- webhook-only writes
-- ---------------------------------------------------------------------------

ALTER TABLE public.purchased_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their purchases" ON public.purchased_content;
DROP POLICY IF EXISTS "Users can insert own purchases"   ON public.purchased_content;
DROP POLICY IF EXISTS "Users can update own purchases"   ON public.purchased_content;
DROP POLICY IF EXISTS "Users can delete own purchases"   ON public.purchased_content;

-- Reads only. A user can see what they paid for; nothing more.
CREATE POLICY "Users can view own purchases"
  ON public.purchased_content
  FOR SELECT
  USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.purchased_content FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.purchased_content FROM authenticated;

-- ---------------------------------------------------------------------------
-- 2. subscriptions -- webhook-only writes
-- ---------------------------------------------------------------------------

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription"      ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription"      ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscription"      ON public.subscriptions;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.subscriptions FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.subscriptions FROM authenticated;

-- ---------------------------------------------------------------------------
-- 3. Post-conditions
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  leak text;
BEGIN
  -- No unconditional write policy may remain anywhere in the schema.
  SELECT string_agg(format('%s(%s)', tablename, cmd), ', ')
    INTO leak
  FROM pg_policies
  WHERE schemaname = 'public'
    AND cmd IN ('UPDATE', 'DELETE', 'INSERT')
    AND (qual = 'true' OR with_check = 'true');

  IF leak IS NOT NULL THEN
    RAISE EXCEPTION 'unconditional write policy remains: %', leak;
  END IF;

  IF has_table_privilege('authenticated', 'public.purchased_content', 'INSERT') THEN
    RAISE EXCEPTION 'SEC-04: authenticated can still self-grant purchased_content';
  END IF;

  IF has_table_privilege('authenticated', 'public.subscriptions', 'UPDATE') THEN
    RAISE EXCEPTION 'SEC-04: authenticated can still rewrite subscriptions';
  END IF;

  -- Reads must still work, or the entitlement UI breaks.
  IF NOT has_table_privilege('authenticated', 'public.purchased_content', 'SELECT') THEN
    RAISE EXCEPTION 'SEC-04: authenticated lost read access to purchased_content';
  END IF;

  IF NOT has_table_privilege('authenticated', 'public.subscriptions', 'SELECT') THEN
    RAISE EXCEPTION 'SEC-04: authenticated lost read access to subscriptions';
  END IF;

  RAISE NOTICE 'SEC-04 OK: entitlements are webhook-only, client reads preserved';
END $$;

COMMIT;