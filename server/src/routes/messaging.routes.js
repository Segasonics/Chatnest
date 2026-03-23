import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendMessage } from '../controllers/messaging.controller.js';
import { sendMessageSchema } from '../validators/messaging.validators.js';

const router = express.Router({ mergeParams: true });

router.post('/', requireAuth, requireWorkspaceAccess, validate({ body: sendMessageSchema }), asyncHandler(sendMessage));

export default router;
