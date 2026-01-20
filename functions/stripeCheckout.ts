import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Create products & prices in Stripe Dashboard:
// 1. Premium - $9.99/month - Recurring
// 2. Pro - $19.99/month - Recurring
// Then paste the price IDs here
const priceIds = {
  premium: Deno.env.get('STRIPE_PRICE_PREMIUM') || 'price_premium',
  pro: Deno.env.get('STRIPE_PRICE_PRO') || 'price_pro'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!priceIds[planId]) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get or create Stripe customer
    let stripeCustomerId;
    const subscriptions = await base44.entities.Subscription.filter({ user_id: user.id });
    const subscription = subscriptions[0];

    if (subscription?.stripe_customer_id) {
      stripeCustomerId = subscription.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      stripeCustomerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceIds[planId],
        quantity: 1
      }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/subscription`,
      metadata: {
        user_id: user.id,
        plan: planId
      }
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});