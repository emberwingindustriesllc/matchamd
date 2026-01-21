import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key - must be set in Stripe dashboard settings
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Sq3vGAgk0bRnEn1LZ7TSINlIEzyv64d8guOpuQiJRvyMmJrMRiteLqzaOK69q2NbHRBHPTyRciMCvmUiXZlYKrG007lPWf5IG';

let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.error('Stripe publishable key not configured');
      return null;
    }
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export { getStripe };