import { User } from '../models/User.js';
import { createCheckoutSession, parseWebhookEvent } from '../services/billing/stripe.service.js';
import { syncPlanByEvent } from '../services/billing/billing.service.js';
import { ApiError } from '../utils/apiError.js';

export async function createCheckout(req, res) {
  const user = await User.findById(req.auth.userId);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

  const session = await createCheckoutSession({
    customerId: user.stripeCustomerId,
    plan: req.body.plan,
    userId: user._id.toString()
  });

  res.json({ success: true, data: session });
}

export async function billingWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  const event = parseWebhookEvent(req.body, signature);
  await syncPlanByEvent(event);
  res.json({ received: true });
}

export async function getBillingMe(req, res) {
  const user = await User.findById(req.auth.userId).select('plan messageCreditsRemaining stripeCustomerId');
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

  res.json({
    success: true,
    data: {
      plan: user.plan,
      messageCreditsRemaining: user.messageCreditsRemaining,
      stripeCustomerId: user.stripeCustomerId
    }
  });
}
