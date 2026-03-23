import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { metaWebhook, verifyMetaWebhook, whatsappWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

router.get('/whatsapp/meta', asyncHandler(verifyMetaWebhook));
router.post('/whatsapp/meta', asyncHandler(metaWebhook));
router.post('/whatsapp/:workspaceId', asyncHandler(whatsappWebhook));

export default router;
