import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  completeMetaEmbeddedSignup,
  disconnectMetaProvider,
  getMetaEmbeddedSignupConfig,
  getMetaWebhookStatus
} from '../controllers/meta.controller.js';
import { metaConnectSchema } from '../validators/meta.validators.js';

const router = express.Router({ mergeParams: true });

router.get(
  '/embedded-signup-config',
  requireAuth,
  requireWorkspaceAccess,
  asyncHandler(getMetaEmbeddedSignupConfig)
);
router.get(
  '/webhook-status',
  requireAuth,
  requireWorkspaceAccess,
  asyncHandler(getMetaWebhookStatus)
);
router.post(
  '/complete',
  requireAuth,
  requireWorkspaceAccess,
  validate({ body: metaConnectSchema }),
  asyncHandler(completeMetaEmbeddedSignup)
);
router.delete(
  '/disconnect',
  requireAuth,
  requireWorkspaceAccess,
  asyncHandler(disconnectMetaProvider)
);

export default router;
