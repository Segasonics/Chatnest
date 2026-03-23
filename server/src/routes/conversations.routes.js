import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getConversation, listConversations } from '../controllers/conversation.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/', requireAuth, requireWorkspaceAccess, asyncHandler(listConversations));
router.get('/:conversationId', requireAuth, requireWorkspaceAccess, asyncHandler(getConversation));

export default router;
