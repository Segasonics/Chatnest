import { stripe } from '../../config/stripe.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

const PLAN_TO_PRICE = {
  free: env.STRIPE_PRICE_FREE,
  pro: env.STRIPE_PRICE_PRO,
  team: env.STRIPE_PRICE_TEAM
};

export async function createCheckoutSession({ customerId, plan, userId }) {
  if (!stripe) throw new ApiError(503, 'STRIPE_DISABLED', 'Stripe is not configured');

  const priceId = PLAN_TO_PRICE[plan];
  if (!priceId && plan !== 'free') {
    throw new ApiError(400, 'INVALID_PLAN', 'Plan is not configured in Stripe');
  }

  if (plan === 'free') {
    return { url: `${env.APP_URL}/billing?plan=free` };
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    success_url: `${env.APP_URL}/billing?success=true`,
    cancel_url: `${env.APP_URL}/billing?cancel=true`,
    line_items: [{ price: priceId, quantity: 1 }],
    customer: customerId,
    client_reference_id: userId,
    allow_promotion_codes: true
  });

  return { url: session.url, id: session.id };
}

export function parseWebhookEvent(rawBody, signature) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    throw new ApiError(503, 'STRIPE_DISABLED', 'Stripe webhook is not configured');
  }

  return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}
