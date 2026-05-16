import { Capacitor } from '@capacitor/core';
import { supabase } from '@/api/supabaseClient';
import { getStripe } from '@/components/stripe/StripeProvider';

/**
 * MatchaMD Purchase Manager
 * Abstracts payment logic between Web (Stripe) and Native (Apple IAP).
 */
export const purchaseManager = {
  /**
   * Determine the current environment.
   */
  isNative: () => Capacitor.isNativePlatform(),
  isIOS: () => Capacitor.getPlatform() === 'ios',

  /**
   * Handle subscription plan checkout.
   * @param {string} planId - The ID of the plan to purchase (e.g., 'premium', 'pro').
   * @param {Object} options - Additional checkout options.
   */
  async purchasePlan(planId, options = {}) {
    if (this.isNative() && this.isIOS()) {
      console.log(`[MatchaMD IAP] Initializing Apple IAP for plan: ${planId}`);
      // NOTE: For the final build, replace this with @capacitor/revenuecat or generic StoreKit.
      // E.g., const result = await Purchases.purchasePackage(package);
      alert(`MATCHAMD: On iOS, this will trigger the native Apple IAP for ${planId}.`);
      return { success: false, method: 'iap_pending' };
    }

    // Default Web/Stripe flow
    console.log(`[MatchaMD Stripe] Initializing Stripe Checkout for plan: ${planId}`);
    try {
      const { data, error } = await supabase.functions.invoke('stripeCheckout', { 
        body: { planId, ...options }
      });
      if (error) throw error;
      
      const stripe = await getStripe();
      if (stripe && data.url) {
        window.location.href = data.url;
        return { success: true, method: 'stripe_redirect' };
      }
      return { success: false, error: 'Stripe initialization failed' };
    } catch (error) {
      console.error('[MatchaMD Stripe] Error:', error);
      throw error;
    }
  },

  /**
   * Handle one-time add-on checkout.
   * @param {string} addOnId - The ID of the content to purchase.
   * @param {string} addOnName - Display name for the checkout.
   */
  async purchaseAddOn(addOnId, addOnName) {
    if (this.isNative() && this.isIOS()) {
      console.log(`[MatchaMD IAP] Initializing Apple IAP for add-on: ${addOnId}`);
      alert(`MATCHAMD: On iOS, this will trigger the native Apple IAP for ${addOnName}.`);
      return { success: false, method: 'iap_pending' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('stripeOneTimeCheckout', {
        body: { addOnId, addOnName }
      });
      if (error) throw error;
      
      const stripe = await getStripe();
      if (stripe && data.url) {
        window.location.href = data.url;
        return { success: true, method: 'stripe_redirect' };
      }
      return { success: false, error: 'Stripe initialization failed' };
    } catch (error) {
      console.error('[MatchaMD Stripe] Error:', error);
      throw error;
    }
  },

  /**
   * Handle customer portal / subscription management.
   */
  async manageSubscription() {
    if (this.isNative() && this.isIOS()) {
      // On iOS, users manage subscriptions in their Apple ID settings.
      alert('MATCHAMD: Please manage your subscription in your iOS App Store settings.');
      return { success: true };
    }

    try {
      const { data, error } = await supabase.functions.invoke('stripePortal', { body: {} });
      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      }
    } catch (error) {
      console.error('[MatchaMD Stripe Portal] Error:', error);
      throw error;
    }
  }
};
