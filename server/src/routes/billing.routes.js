import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createCheckout, getBillingMe } from '../controllers/billing.controller.js';
import { createCheckoutSchema } from '../validators/billing.validators.js';

const router = express.Router();

router.post('/create-checkout-session', requireAuth, validate({ body: createCheckoutSchema }), asyncHandler(createCheckout));
router.get('/me', requireAuth, asyncHandler(getBillingMe));

export default router;
