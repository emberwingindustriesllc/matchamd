import { Capacitor } from '@capacitor/core';
import { supabase } from '@/api/supabaseClient';
import { getStripe } from '@/components/stripe/StripeProvider';

/**
 * MatchaMD Purchase Manager
 * Abstracts payment logic between Web (Stripe) and Native (RevenueCat IAP).
 */
export const purchaseManager = {
  /**
   * Determine the current environment.
   */
  isNative: () => Capacitor.isNativePlatform(),
  isIOS: () => Capacitor.getPlatform() === 'ios',

  /**
   * Initialize RevenueCat SDK on native platform.
   * @param {string|null} userId - The Supabase auth user ID if logged in.
   */
  async initialize(userId = null) {
    if (!this.isNative()) return;

    try {
      const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
      
      const apiKey = this.isIOS()
        ? import.meta.env.VITE_REVENUECAT_IOS_API_KEY
        : import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY;

      if (!apiKey || apiKey.startsWith('your_') || apiKey === '') {
        console.warn('[MatchaMD RevenueCat] API Key is not configured. Skipping initialization.');
        return;
      }

      await Purchases.configure({
        apiKey: apiKey,
        appUserID: userId || undefined
      });

      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      console.log('[MatchaMD RevenueCat] Initialized and configured successfully.');
    } catch (error) {
      console.error('[MatchaMD RevenueCat] Initialization failed:', error);
    }
  },

  /**
   * Log in user to RevenueCat.
   * @param {string} userId - The Supabase auth user ID.
   */
  async logIn(userId) {
    if (!this.isNative()) return;
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      await Purchases.logIn({ appUserID: userId });
      console.log(`[MatchaMD RevenueCat] User logged in: ${userId}`);
    } catch (error) {
      console.error('[MatchaMD RevenueCat] Login failed:', error);
    }
  },

  /**
   * Log out user from RevenueCat.
   */
  async logOut() {
    if (!this.isNative()) return;
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      await Purchases.logOut();
      console.log('[MatchaMD RevenueCat] User logged out');
    } catch (error) {
      console.error('[MatchaMD RevenueCat] Logout failed:', error);
    }
  },

  /**
   * Core purchase helper using RevenueCat.
   * Checks current Offerings first (recommended) and falls back to direct SKU search.
   * @param {string} productId - Product/SKU ID or Package Identifier.
   */
  async purchaseNativeProductOrPackage(productId) {
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');

      // 1. Try to find package in current Offerings
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings && offerings.current) {
          const pkg = offerings.current.availablePackages.find(
            p => p.identifier === productId || p.product.identifier === productId
          );
          if (pkg) {
            console.log(`[MatchaMD RevenueCat] Purchasing package from offerings: ${pkg.identifier}`);
            const result = await Purchases.purchasePackage({ aPackage: pkg });
            return { success: true, method: 'revenuecat_iap', result };
          }
        }
      } catch (offeringError) {
        console.warn('[MatchaMD RevenueCat] Failed to fetch offerings, falling back to direct product fetch:', offeringError);
      }

      // 2. Fallback to direct product purchase
      console.log(`[MatchaMD RevenueCat] Product not found in offerings. Fetching product directly: ${productId}`);
      const { products } = await Purchases.getProducts({ productIdentifiers: [productId] });
      if (products && products.length > 0) {
        console.log(`[MatchaMD RevenueCat] Purchasing store product directly: ${products[0].identifier}`);
        const result = await Purchases.purchaseStoreProduct({ product: products[0] });
        return { success: true, method: 'revenuecat_iap', result };
      }

      throw new Error(`Product/Package with ID '${productId}' was not found in RevenueCat dashboard.`);
    } catch (error) {
      if (error.userCancelled) {
        console.log('[MatchaMD RevenueCat] User cancelled the purchase.');
        return { success: false, error: 'User cancelled' };
      }
      console.error('[MatchaMD RevenueCat] Native purchase failed:', error);
      alert(`MATCHAMD: Native purchase failed. ${error.message || error}`);
      throw error;
    }
  },

  /**
   * Handle subscription plan checkout.
   * @param {string} planId - The ID of the plan to purchase (e.g., 'premium', 'pro').
   * @param {Object} options - Additional checkout options.
   */
  async purchasePlan(planId, options = {}) {
    if (this.isNative()) {
      return this.purchaseNativeProductOrPackage(planId);
    }

    // Default Web/Stripe flow
    console.log(`[MatchaMD Stripe] Initializing Stripe Checkout for plan: ${planId}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('stripeCheckout', { 
        body: { planId, ...options }
      });
      
      if (error) {
        throw new Error(error.message || JSON.stringify(error));
      }
      
      if (data?.url) {
        const stripe = await getStripe();
        if (stripe) {
          window.location.href = data.url;
          return { success: true, method: 'stripe_redirect' };
        } else {
          throw new Error('Stripe client failed to initialize. Verify VITE_STRIPE_PUBLISHABLE_KEY in .env.local.');
        }
      } else {
        throw new Error('No checkout URL returned from Stripe session creation.');
      }
    } catch (edgeErr) {
      console.error('[MatchaMD Stripe] Stripe checkout error:', edgeErr);
      alert(`MATCHAMD: Stripe Checkout failed. ${edgeErr.message || edgeErr}`);
      throw edgeErr;
    }
  },

  /**
   * Handle one-time add-on checkout.
   * @param {string} addOnId - The ID of the content to purchase.
   * @param {string} addOnName - Display name for the checkout.
   */
  async purchaseAddOn(addOnId, addOnName) {
    if (this.isNative()) {
      return this.purchaseNativeProductOrPackage(addOnId);
    }

    console.log(`[MatchaMD Stripe] Initializing add-on checkout for: ${addOnId}`);

    try {
      const { data, error } = await supabase.functions.invoke('stripeOneTimeCheckout', {
        body: { addOnId, addOnName }
      });
      
      if (error) {
        throw new Error(error.message || JSON.stringify(error));
      }
      
      if (data?.url) {
        const stripe = await getStripe();
        if (stripe) {
          window.location.href = data.url;
          return { success: true, method: 'stripe_redirect' };
        } else {
          throw new Error('Stripe client failed to initialize. Verify VITE_STRIPE_PUBLISHABLE_KEY in .env.local.');
        }
      } else {
        throw new Error('No checkout URL returned from Stripe session creation.');
      }
    } catch (edgeErr) {
      console.error('[MatchaMD Stripe] Stripe checkout error:', edgeErr);
      alert(`MATCHAMD: Stripe Checkout failed. ${edgeErr.message || edgeErr}`);
      throw edgeErr;
    }
  },

  /**
   * Handle customer portal / subscription management.
   */
  async manageSubscription() {
    if (this.isNative()) {
      const url = this.isIOS()
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';

      console.log(`[MatchaMD RevenueCat] Redirecting to native subscription management settings: ${url}`);
      window.open(url, '_system');
      alert(`MATCHAMD: Opening subscription settings. Redirecting to ${this.isIOS() ? 'App Store' : 'Google Play Store'}...`);
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
