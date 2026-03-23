import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listLeads, updateLead } from '../controllers/lead.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/', requireAuth, requireWorkspaceAccess, asyncHandler(listLeads));
router.patch('/:leadId', requireAuth, requireWorkspaceAccess, asyncHandler(updateLead));

export default router;
