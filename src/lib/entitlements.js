/**
 * Central entitlement resolution.
 *
 * Why this file exists: access decisions were scattered across pages, each doing
 * its own localStorage + table read, and most advertised premium features were
 * never gated at all. This module is the single place that answers "may this
 * user use X", so that gating an existing feature is a one-line change here
 * rather than an audit of every page.
 *
 * IMPORTANT (issue #3): this is still CLIENT-side resolution. It stops a casual
 * user from clicking through a paywall, which is the bar we can actually meet
 * in a client app, but a determined user can still forge localStorage. Real
 * enforcement requires the server to own entitlement -- see the proposal in
 * issue #3. Do not mistake this for security.
 */

import { supabase } from '@/api/supabaseClient';
import { isReviewerAccount } from '@/utils';

/** Content IDs that are individually purchasable (one-time add-ons). */
export const ONE_TIME_CONTENT = {
  INTERVIEW_COURSE: 'interview_premium',
  SURGERY_GUIDE: 'specialty_surgery',
  QUIZ_PACK: 'quiz_usmle',
};

/**
 * Features advertised on the Subscription page, and whether they require a
 * paid entitlement. `null` means the feature is free for everyone.
 *
 * This table is the single source of truth for "is this actually gated?".
 */
export const FEATURE_ACCESS = {
  // Free tier -- the acquisition engine. Search must never be paywalled.
  PROGRAM_SEARCH: null,
  PROGRAM_DETAIL: null,
  SAVED_SEARCHES: null,
  COST_CALCULATOR: null,
  GUIDES_CORE: null,
  DEADLINES: null,
  COMMUNITY_READ: null,

  // Individually purchasable add-ons.
  INTERVIEW_COURSE: ONE_TIME_CONTENT.INTERVIEW_COURSE,
  SURGERY_GUIDE: ONE_TIME_CONTENT.SURGERY_GUIDE,
  QUIZ_PACK: ONE_TIME_CONTENT.QUIZ_PACK,

  // Subscription-gated. Each maps to a plan in the `subscriptions` table.
  PROFILE_EXPORTS: 'premium',   // CV / profile PDF+JSON export
  FIT_ANALYSIS: 'premium',      // deep fit scoring vs profile
  DEADLINE_ALERTS: 'premium',   // push notifications for match deadlines
  COMMUNITY_POST: 'premium',    // posting notes / scam reports
  DATA_EXPORT: 'premium',       // full data archive export

  // Human-service tier -- delivered by a person, not the software.
  ASYNC_REVIEW: 'pro',
};

const PLAN_RANK = { free: 0, premium: 1, pro: 2 };

/** True if `plan` is at least as high as `required`. */
export function planSatisfies(plan, required) {
  if (!required) return true;
  const have = PLAN_RANK[String(plan || 'free').toLowerCase()] ?? 0;
  const need = PLAN_RANK[String(required).toLowerCase()] ?? 0;
  return have >= need;
}

/** Read localStorage demo subscription, if any. */
function readLocalSubscription() {
  try {
    const raw = localStorage.getItem('matchamd_active_subscription');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.status === 'active' ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Resolve what the current user is entitled to.
 *
 * Sources, in order of trust (client-side, so "trust" is relative):
 *   1. `subscriptions` table  -- written by the Stripe webhook
 *   2. `purchased_content`    -- one-time add-ons, written by the webhook
 *   3. localStorage demo state -- staging only; see issue #3
 */
export async function resolveEntitlements(user) {
  const content = new Set();
  let plan = 'free';

  if (isReviewerAccount(user)) {
    return { plan: 'pro', content: new Set(Object.values(ONE_TIME_CONTENT)), isReviewer: true };
  }

  if (user?.id) {
    try {
      const [{ data: subs }, { data: purchases }] = await Promise.all([
        supabase.from('subscriptions').select('plan,status').eq('user_id', user.id),
        supabase.from('purchased_content').select('content_id').eq('user_id', user.id),
      ]);
      const active = (subs || []).find((s) => s.status === 'active');
      if (active?.plan) plan = String(active.plan).toLowerCase();
      (purchases || []).forEach((p) => p.content_id && content.add(p.content_id));
    } catch {
      // Network/RLS failure must not lock a paying user out of their own data.
    }
  }

  const local = readLocalSubscription();
  if (local?.plan && PLAN_RANK[String(local.plan).toLowerCase()] > PLAN_RANK[plan]) {
    plan = String(local.plan).toLowerCase();
  }
  try {
    const localContent = JSON.parse(localStorage.getItem('matchamd_purchased_content') || '[]');
    localContent.forEach((p) => p.content_id && content.add(p.content_id));
  } catch {
    // ignore malformed local state
  }

  return { plan, content, isReviewer: false };
}

/** Does the resolved entitlement set allow `feature`? */
export function canAccess(entitlements, feature) {
  if (!entitlements) return false;
  if (entitlements.isReviewer) return true;

  const required = FEATURE_ACCESS[feature];
  if (required === undefined) {
    // Unknown feature: fail closed rather than accidentally granting access.
    return false;
  }
  if (required === null) return true;

  if (ONE_TIME_CONTENT[feature]) return entitlements.content.has(ONE_TIME_CONTENT[feature]);
  return planSatisfies(entitlements.plan, required);
}