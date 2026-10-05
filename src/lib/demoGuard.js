/**
 * Demo-mode entitlement activation -- PRODUCTION GUARD.
 *
 * Why this file exists
 * --------------------
 * `purchaseManager.activateDemoSubscription()` and `activateDemoAddOn()` wrote a
 * Pro subscription or a purchased-content unlock straight into localStorage.
 * That is fine on a staging build and catastrophic on production: anyone could
 * open devtools, call the function (or just write the localStorage key), and get
 * every paid feature for free. There was no check that the build was non-prod.
 *
 * The fix is deliberately conservative: demo activation is allowed only when
 * the build is explicitly NOT production. We do not try to detect "is this a
 * staging deployment" via URL heuristics, because a misdetected production URL
 * would re-open the hole. The rule is a hard `import.meta.env.PROD` gate.
 *
 * If staging genuinely needs demo mode while Vercel reports it as a
 * Production-environment build, the correct fix is a separate Vercel *Preview*
 * project or an explicit `VITE_ALLOW_DEMO_ENTITLEMENTS=true` set only on that
 * project's environment variables -- NOT weakening this check.
 */

import { toast } from 'sonner';
import { purchaseManager } from '@/lib/purchaseManager';

/**
 * True only in a non-production build, unless explicitly opted in.
 *
 * Vite inlines `import.meta.env.PROD` and `import.meta.env.VITE_*` at build
 * time, so these are compile-time constants -- a production bundle cannot have
 * the gate flipped by editing localStorage or runtime env.
 */
export function isDemoEntitlementAllowed() {
  // An explicit opt-in escape hatch, still compile-time inlined. Use only for a
  // dedicated staging deployment whose env vars you control.
  const explicit = import.meta.env.VITE_ALLOW_DEMO_ENTITLEMENTS;
  if (explicit === 'true') return true;

  return !import.meta.env.PROD;
}

const PRODUCTION_MESSAGE =
  'Demo mode is disabled in production builds. Purchase to unlock this content.';

/**
 * Activate a demo subscription, but only outside production.
 * @returns {object|null} the demo subscription, or null if blocked.
 */
export function activateDemoSubscriptionGuarded(planId = 'premium') {
  if (!isDemoEntitlementAllowed()) {
    console.warn('[entitlements] Blocked demo subscription activation in a production build.');
    toast?.error?.(PRODUCTION_MESSAGE);
    return null;
  }
  return purchaseManager.activateDemoSubscription(planId);
}

/**
 * Activate a demo add-on unlock, but only outside production.
 * @returns {object|null} the demo purchase, or null if blocked.
 */
export function activateDemoAddOnGuarded(addOnId, addOnName) {
  if (!isDemoEntitlementAllowed()) {
    console.warn('[entitlements] Blocked demo add-on activation in a production build.');
    toast?.error?.(PRODUCTION_MESSAGE);
    return null;
  }
  return purchaseManager.activateDemoAddOn(addOnId, addOnName);
}