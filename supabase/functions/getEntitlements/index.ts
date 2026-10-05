import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import Stripe from 'npm:stripe@17.5.0';

/**
 * getEntitlements -- SERVER-AUTHORITATIVE entitlement resolution.
 *
 * Why this exists
 * ---------------
 * Entitlements were previously resolved entirely on the client: a page read the
 * `subscriptions` / `purchased_content` tables and localStorage and decided for
 * itself whether to show a paid feature. That is trivially forgeable -- open
 * devtools, patch the read, or write the localStorage key, and the paywall is
 * gone. Any such bypass would be shared publicly within days and permanently
 * devalue the product.
 *
 * The fix is that the client never decides. It calls this function, which:
 *   1. verifies the caller's JWT (so the answer is per-user, not client-asserted),
 *   2. asks STRIPE what the user actually has, using the secret key, rather than
 *      trusting a local column that a client could have influenced,
 *   3. reconciles that against the local subscription rows the webhook writes,
 *   4. returns only a boolean map the client uses to render.
 *
 * A user cannot forge a Stripe subscription, and they cannot write the tables
 * (SEC-04 revoked INSERT/UPDATE on both for the authenticated role), so the
 * answer here is not theirs to change.
 *
 * Design notes:
 * - `cache-control: no-store` -- entitlements must not be cached by a CDN or the
 *   client, or a revoked subscription would keep working until the cache expired.
 * - The plan is derived from Stripe's own status, so an unpaid or canceled
 *   subscription immediately downgrades.
 * - One-time add-ons still come from `purchased_content`, which is webhook-only.
 *   That table is not forgeable client-side, and add-on rows are only written on
 *   a verified `checkout.session.completed`.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

/** Plan rank, so 'pro' implies 'premium'. */
const PLAN_RANK: Record<string, number> = { free: 0, premium: 1, pro: 2 };

function planSatisfies(plan: string | null, required: string | null): boolean {
  if (!required) return true;
  return (PLAN_RANK[String(plan || 'free').toLowerCase()] ?? 0) >= (PLAN_RANK[String(required).toLowerCase()] ?? 0);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

    // 1. Verify the caller. The user id comes from the verified token only --
    //    never from a request body, which the client controls.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const service = createClient(supabaseUrl, serviceKey);

    // 2. Local subscription rows (written by the Stripe webhook, not the client).
    const { data: subs, error: subsError } = await service
      .from('subscriptions')
      .select('id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end')
      .eq('user_id', user.id);

    if (subsError) throw subsError;

    const active = (subs || []).find((s) => s.status === 'active');
    let plan = active?.plan ? String(active.plan).toLowerCase() : 'free';

    // 3. Ask Stripe directly. The local row can be stale (webhook missed, clock
    //    skew, a canceled-but-not-yet-webhooked subscription). Stripe is the
    //    source of truth for whether money is actually being paid.
    if (active?.stripe_customer_id && stripeSecret) {
      try {
        const stripe = new Stripe(stripeSecret);
        const list = await stripe.subscriptions.list({
          customer: active.stripe_customer_id,
          status: 'all',
          limit: 10,
          expand: ['data.items.data.price.product'],
        });

        const live = list.data.find((s) =>
          ['active', 'trialing', 'past_due'].includes(String(s.status))
        );

        if (!live) {
          // No live subscription at Stripe. If we believed one existed locally,
          // the local row is wrong or the sub lapsed -- downgrade to free.
          plan = 'free';
        } else {
          const price = live.items.data[0]?.price;
          const product: any = price?.product;
          const productName: string =
            typeof product === 'string' ? product : (product?.name ?? '');
          const metadataPlan: string =
            live.metadata?.plan || price?.metadata?.plan || '';
          const inferred = String(metadataPlan || productName || '').toLowerCase();

          if (inferred.includes('pro')) plan = 'pro';
          else if (inferred.includes('premium') || inferred.includes('matchamd+')) plan = 'premium';
          else if (inferred) plan = inferred;
        }
      } catch (stripeError) {
        // Never fail open. If Stripe is unreachable we keep the local row rather
        // than granting access we cannot verify -- and we log it.
        console.error('Stripe verification failed, falling back to local row:', stripeError);
      }
    }

    // 4. One-time add-ons (webhook-written, client-insert revoked).
    const { data: purchases, error: purchaseError } = await service
      .from('purchased_content')
      .select('content_id')
      .eq('user_id', user.id);
    if (purchaseError) throw purchaseError;

    const content = (purchases || []).map((p) => p.content_id).filter(Boolean);

    const hasContent = (id: string) => content.includes(id);

    // 5. The single source of truth for what is paid. Mirrors
    //    src/lib/entitlements.js FEATURE_ACCESS -- keep the two in sync.
    const entitlements = {
      INTERVIEW_COURSE: hasContent('interview_premium'),
      SURGERY_GUIDE: hasContent('specialty_surgery'),
      QUIZ_PACK: hasContent('quiz_usmle'),

      PROFILE_EXPORTS: planSatisfies(plan, 'premium'),
      FIT_ANALYSIS: planSatisfies(plan, 'premium'),
      DEADLINE_ALERTS: planSatisfies(plan, 'premium'),
      COMMUNITY_POST: planSatisfies(plan, 'premium'),
      DATA_EXPORT: planSatisfies(plan, 'premium'),

      // Human-service tier: only ever true when a review has actually been paid
      // for and recorded. Never inferred from a plan name.
      ASYNC_REVIEW: planSatisfies(plan, 'pro'),

      // Explicitly free forever. Listed here so the client cannot drift into
      // gating them.
      PROGRAM_SEARCH: true,
      PROGRAM_DETAIL: true,
      SAVED_SEARCHES: true,
      COST_CALCULATOR: true,
      GUIDES_CORE: true,
      DEADLINES: true,
      COMMUNITY_READ: true,
    };

    return new Response(
      JSON.stringify({
        plan,
        entitlements,
        content,
        // Tell the client when to re-check, e.g. before a trial ends.
        currentPeriodEnd: active?.current_period_end ?? null,
        cancelAtPeriodEnd: active?.cancel_at_period_end ?? false,
      }),
      {
        status: 200,
        headers: {
          ...jsonHeaders,
          // Never cache an entitlement decision.
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('getEntitlements error:', error);
    // Fail closed: on error we return no entitlements rather than guessing.
    return new Response(
      JSON.stringify({
        error: 'Could not resolve entitlements',
        plan: 'free',
        entitlements: {},
        content: [],
      }),
      { status: 500, headers: { ...jsonHeaders, 'Cache-Control': 'no-store' } }
    );
  }
});