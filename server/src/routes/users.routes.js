import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getMe } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/me', requireAuth, asyncHandler(getMe));

export default router;
