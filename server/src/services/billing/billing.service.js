import { User } from '../../models/User.js';
import { PLAN_QUOTAS } from '../../constants/quotas.js';

function mapPriceToPlan(priceId) {
  const map = {
    [process.env.STRIPE_PRICE_PRO]: 'pro',
    [process.env.STRIPE_PRICE_TEAM]: 'team'
  };
  return map[priceId] || 'free';
}

export async function syncPlanByEvent(event) {
  const type = event.type;

  if (type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const user = await User.findById(userId);
    if (!user) return;

    if (session.customer) user.stripeCustomerId = String(session.customer);
    await user.save();
    return;
  }

  if (type === 'customer.subscription.updated' || type === 'customer.subscription.created') {
    const subscription = event.data.object;
    const customerId = String(subscription.customer);
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) return;

    const priceId = subscription.items?.data?.[0]?.price?.id;
    const plan = mapPriceToPlan(priceId);
    user.plan = plan;
    user.messageCreditsRemaining = PLAN_QUOTAS[plan];
    user.lastCreditResetAt = new Date();
    await user.save();
    return;
  }

  if (type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = String(subscription.customer);
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) return;

    user.plan = 'free';
    user.messageCreditsRemaining = PLAN_QUOTAS.free;
    user.lastCreditResetAt = new Date();
    await user.save();
    return;
  }

  if (type === 'invoice.paid') {
    const invoice = event.data.object;
    const customerId = String(invoice.customer);
    const user = await User.findOne({ stripeCustomerId: customerId });
    if (!user) return;

    user.messageCreditsRemaining = PLAN_QUOTAS[user.plan] || PLAN_QUOTAS.free;
    user.lastCreditResetAt = new Date();
    await user.save();
  }
}
