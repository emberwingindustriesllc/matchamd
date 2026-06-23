import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the modules before importing
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
    getPlatform: vi.fn(),
  },
}));

vi.mock('@/api/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock('@/components/stripe/StripeProvider', () => ({
  getStripe: vi.fn(),
}));

describe('Purchase Manager', () => {
  let purchaseManager;
  let mockCapacitor;

  beforeEach(async () => {
    vi.resetModules();
    mockCapacitor = (await import('@capacitor/core')).Capacitor;
    
    // Re-import after mocks are set up
    purchaseManager = (await import('@/lib/purchaseManager')).purchaseManager;
  });

  describe('Environment detection', () => {
    it('isNative returns false on web', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(false);
      expect(purchaseManager.isNative()).toBe(false);
    });

    it('isNative returns true on native', () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      expect(purchaseManager.isNative()).toBe(true);
    });

    it('isIOS returns true on iOS', () => {
      mockCapacitor.getPlatform.mockReturnValue('ios');
      expect(purchaseManager.isIOS()).toBe(true);
    });

    it('isIOS returns false on Android', () => {
      mockCapacitor.getPlatform.mockReturnValue('android');
      expect(purchaseManager.isIOS()).toBe(false);
    });
  });

  describe('purchasePlan routing', () => {
    it('uses native flow when isNative is true', async () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      mockCapacitor.getPlatform.mockReturnValue('ios');
      
      const result = await purchaseManager.purchasePlan('premium');
      
      // Should attempt native purchase
      expect(result).toBeDefined();
    });

    it('uses web/stripe flow when isNative is false', async () => {
      mockCapacitor.isNativePlatform.mockReturnValue(false);
      
      const { supabase } = await import('@/api/supabaseClient');
      supabase.functions.invoke.mockResolvedValue({ 
        data: { url: 'https://checkout.stripe.com/test' }, 
        error: null 
      });

      const { getStripe } = await import('@/components/stripe/StripeProvider');
      getStripe.mockResolvedValue({
        redirectToCheckout: vi.fn().mockResolvedValue({ error: null })
      });

      const result = await purchaseManager.purchasePlan('premium');
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith('stripeCheckout', { 
        body: { planId: 'premium' } 
      });
    });
  });

  describe('manageSubscription routing', () => {
    it('opens App Store on iOS native', async () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      mockCapacitor.getPlatform.mockReturnValue('ios');
      
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});
      
      await purchaseManager.manageSubscription();
      
      expect(openSpy).toHaveBeenCalledWith('https://apps.apple.com/account/subscriptions', '_system');
      openSpy.mockRestore();
    });

    it('opens Play Store on Android native', async () => {
      mockCapacitor.isNativePlatform.mockReturnValue(true);
      mockCapacitor.getPlatform.mockReturnValue('android');
      
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});
      
      await purchaseManager.manageSubscription();
      
      expect(openSpy).toHaveBeenCalledWith('https://play.google.com/store/account/subscriptions', '_system');
      openSpy.mockRestore();
    });

    it('uses Stripe portal on web', async () => {
      mockCapacitor.isNativePlatform.mockReturnValue(false);
      
      const { supabase } = await import('@/api/supabaseClient');
      supabase.functions.invoke.mockResolvedValue({ 
        data: { url: 'https://billing.stripe.com/test' }, 
        error: null 
      });

      await purchaseManager.manageSubscription();
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith('stripePortal', { body: {} });
    });
  });
});