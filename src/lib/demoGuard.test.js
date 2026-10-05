/**
 * Tests for the demo-entitlement production guard (issue #3).
 *
 * The hole being closed: purchaseManager.activateDemoSubscription() and
 * activateDemoAddOn() wrote paid entitlements straight to localStorage with no
 * check that the build was non-production. In a production bundle that handed
 * every paid feature to anyone willing to open devtools.
 *
 * These tests pin the guard's *decision function* rather than the Vite-inlined
 * constant, because `import.meta.env.PROD` is resolved at build time and is
 * `false` under Vitest.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const activateDemoSubscription = vi.fn(() => ({ id: 'demo_1' }));
const activateDemoAddOn = vi.fn(() => ({ id: 'demo_purchase_1' }));

vi.mock('@/lib/purchaseManager', () => ({
  purchaseManager: {
    activateDemoSubscription: (...a) => activateDemoSubscription(...a),
    activateDemoAddOn: (...a) => activateDemoAddOn(...a),
  },
}));

const toastError = vi.fn();
vi.mock('sonner', () => ({ toast: { error: (...a) => toastError(...a) } }));

import {
  isDemoEntitlementAllowed,
  activateDemoSubscriptionGuarded,
  activateDemoAddOnGuarded,
} from '@/lib/demoGuard';

beforeEach(() => {
  activateDemoSubscription.mockClear();
  activateDemoAddOn.mockClear();
  toastError.mockClear();
  localStorage.clear();
});

describe('demo guard wiring', () => {
  it('reports demo entitlement is allowed under the test build', () => {
    // Vitest sets MODE=test, so PROD is false. This confirms the default branch
    // of the gate is reachable; the production branch is asserted below via the
    // stubbed module flag.
    expect(isDemoEntitlementAllowed()).toBe(true);
  });

  it('delegates to purchaseManager when allowed', () => {
    const result = activateDemoSubscriptionGuarded('pro');
    expect(activateDemoSubscription).toHaveBeenCalledWith('pro');
    expect(result).toEqual({ id: 'demo_1' });
    expect(toastError).not.toHaveBeenCalled();
  });

  it('delegates add-on activation when allowed', () => {
    const result = activateDemoAddOnGuarded('quiz_usmle', 'Quiz Pack');
    expect(activateDemoAddOn).toHaveBeenCalledWith('quiz_usmle', 'Quiz Pack');
    expect(result).toEqual({ id: 'demo_purchase_1' });
  });

  it('writes nothing to localStorage when allowed but purchaseManager does', () => {
    // Sanity: the guarded wrapper must not itself fabricate entitlement state.
    activateDemoSubscriptionGuarded('premium');
    expect(localStorage.getItem('matchamd_active_subscription')).toBeNull();
  });
});

describe('demo guard blocks production builds', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('sonner', () => ({ toast: { error: (...a) => toastError(...a) } }));
    // Simulate a production bundle: PROD true and no explicit opt-in.
    vi.stubEnv('PROD', true);
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_ALLOW_DEMO_ENTITLEMENTS', '');
  });

  it('isDemoEntitlementAllowed() returns false under PROD', async () => {
    const mod = await import('@/lib/demoGuard');
    expect(mod.isDemoEntitlementAllowed()).toBe(false);
  });

  it('activateDemoSubscriptionGuarded is a no-op and does not grant', async () => {
    const mod = await import('@/lib/demoGuard');
    const result = mod.activateDemoSubscriptionGuarded('pro');
    expect(result).toBeNull();
    expect(activateDemoSubscription).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
  });

  it('activateDemoAddOnGuarded is a no-op and does not grant', async () => {
    const mod = await import('@/lib/demoGuard');
    const result = mod.activateDemoAddOnGuarded('quiz_usmle', 'Quiz Pack');
    expect(result).toBeNull();
    expect(activateDemoAddOn).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalled();
  });

  it('honours an explicit opt-in flag for a dedicated staging project', async () => {
    vi.stubEnv('VITE_ALLOW_DEMO_ENTITLEMENTS', 'true');
    const mod = await import('@/lib/demoGuard');
    expect(mod.isDemoEntitlementAllowed()).toBe(true);
    const result = mod.activateDemoSubscriptionGuarded('premium');
    expect(result).toEqual({ id: 'demo_1' });
  });

  it('leaves localStorage free of entitlement keys in production mode', async () => {
    const mod = await import('@/lib/demoGuard');
    mod.activateDemoSubscriptionGuarded('pro');
    mod.activateDemoAddOnGuarded('interview_premium', 'Course');
    expect(localStorage.getItem('matchamd_active_subscription')).toBeNull();
    expect(localStorage.getItem('matchamd_purchased_content')).toBeNull();
  });
});