import express from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import workspaceRoutes from './workspaces.routes.js';
import rulesRoutes from './rules.routes.js';
import flowsRoutes from './flows.routes.js';
import conversationsRoutes from './conversations.routes.js';
import messagingRoutes from './messaging.routes.js';
import webhooksRoutes from './webhooks.routes.js';
import billingRoutes from './billing.routes.js';
import leadsRoutes from './leads.routes.js';
import analyticsRoutes from './analytics.routes.js';
import knowledgeRoutes from './knowledge.routes.js';
import metaRoutes from './meta.routes.js';
import auditRoutes from './audit.routes.js';
import { deleteAsset, listAssets, uploadAsset, uploadAssetMiddleware } from '../controllers/asset.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/billing', billingRoutes);

router.get('/workspaces/:workspaceId/assets', requireAuth, requireWorkspaceAccess, asyncHandler(listAssets));
router.delete('/workspaces/:workspaceId/assets/:assetId', requireAuth, requireWorkspaceAccess, asyncHandler(deleteAsset));
router.post('/workspaces/:id/upload-asset', requireAuth, requireWorkspaceAccess, uploadAssetMiddleware, asyncHandler(uploadAsset));
router.use('/workspaces/:workspaceId/rules', rulesRoutes);
router.use('/workspaces/:workspaceId/flows', flowsRoutes);
router.use('/workspaces/:workspaceId/conversations', conversationsRoutes);
router.use('/workspaces/:workspaceId/send', messagingRoutes);
router.use('/workspaces/:workspaceId/leads', leadsRoutes);
router.use('/workspaces/:workspaceId/analytics', analyticsRoutes);
router.use('/workspaces/:workspaceId/knowledge', knowledgeRoutes);
router.use('/workspaces/:workspaceId/providers/meta', metaRoutes);
router.use('/workspaces/:workspaceId/audit', auditRoutes);

export default router;
