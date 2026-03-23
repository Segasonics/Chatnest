import mongoose from 'mongoose';
import { PLAN_LIST, PLANS } from '../constants/plans.js';
import { ROLES } from '../constants/roles.js';
import { PLAN_QUOTAS } from '../constants/quotas.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    plan: { type: String, enum: PLAN_LIST, default: PLANS.FREE },
    messageCreditsRemaining: { type: Number, default: PLAN_QUOTAS[PLANS.FREE] },
    stripeCustomerId: { type: String },
    lastCreditResetAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
