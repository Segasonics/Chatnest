import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getAuditLogs } from '../controllers/audit.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/', requireAuth, requireWorkspaceAccess, asyncHandler(getAuditLogs));

export default router;
