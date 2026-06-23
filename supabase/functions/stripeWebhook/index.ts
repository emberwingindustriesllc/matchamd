import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? (() => { throw new Error('STRIPE_WEBHOOK_SECRET env var not set') })();

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), { status: 400 });
  }

  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;

        if (!userId) {
          console.warn('No user_id found in session metadata:', session.id);
          break;
        }

        if (session.metadata?.type === 'add_on') {
          const addOnId = session.metadata.add_on_id;
          const { error: dbError } = await supabaseService
            .from('purchased_content')
            .insert({
              user_id: userId,
              content_type: addOnId.includes('quiz') ? 'quiz_pack' : addOnId.includes('specialty') ? 'specialty_guide' : 'interview_prep',
              content_id: addOnId,
              price: session.amount_total ? session.amount_total / 100 : 0,
              stripe_payment_id: session.payment_intent as string
            });

          if (dbError) throw dbError;
        } else {
          const plan = session.metadata?.plan || 'free';
          const { data: subscriptions, error: selectError } = await supabaseService
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId);

          if (selectError) throw selectError;

          if (subscriptions && subscriptions.length > 0) {
            const { error: updateError } = await supabaseService
              .from('subscriptions')
              .update({
                plan,
                status: 'active',
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              })
              .eq('id', subscriptions[0].id);

            if (updateError) throw updateError;
          } else {
            const { error: insertError } = await supabaseService
              .from('subscriptions')
              .insert({
                user_id: userId,
                plan,
                status: 'active',
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              });

            if (insertError) throw insertError;
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const { data: subscriptions, error: selectError } = await supabaseService
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id);

        if (selectError) throw selectError;

        if (subscriptions && subscriptions.length > 0) {
          const { error: updateError } = await supabaseService
            .from('subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : subscription.cancel_at_period_end ? 'cancelled' : 'active',
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('id', subscriptions[0].id);

          if (updateError) throw updateError;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { data: subscriptions, error: selectError } = await supabaseService
          .from('subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscription.id);

        if (selectError) throw selectError;

        if (subscriptions && subscriptions.length > 0) {
          const { error: updateError } = await supabaseService
            .from('subscriptions')
            .update({
              status: 'expired',
              plan: 'free'
            })
            .eq('id', subscriptions[0].id);

          if (updateError) throw updateError;
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error('Payment failed:', paymentIntent.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
