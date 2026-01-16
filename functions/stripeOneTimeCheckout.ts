import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const addOnPrices = {
  quiz_usmle: 499,
  specialty_surgery: 399,
  interview_premium: 999
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addOnId, addOnName } = await req.json();

    if (!addOnPrices[addOnId]) {
      return Response.json({ error: 'Invalid add-on' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: addOnName,
            description: 'One-time purchase'
          },
          unit_amount: addOnPrices[addOnId]
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/subscription?success=true`,
      cancel_url: `${req.headers.get('origin')}/subscription`,
      metadata: {
        user_id: user.id,
        add_on_id: addOnId,
        type: 'add_on'
      }
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});