import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  addKnowledgeText,
  listKnowledge,
  removeKnowledgeDocument,
  queryKnowledge
} from '../controllers/knowledge.controller.js';
import {
  knowledgeDocumentParamSchema,
  knowledgeQuerySchema,
  knowledgeTextSchema
} from '../validators/knowledge.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/', requireAuth, requireWorkspaceAccess, asyncHandler(listKnowledge));
router.post(
  '/text',
  requireAuth,
  requireWorkspaceAccess,
  validate({ body: knowledgeTextSchema }),
  asyncHandler(addKnowledgeText)
);
router.post(
  '/query',
  requireAuth,
  requireWorkspaceAccess,
  validate({ body: knowledgeQuerySchema }),
  asyncHandler(queryKnowledge)
);
router.delete(
  '/:documentId',
  requireAuth,
  requireWorkspaceAccess,
  validate({ params: knowledgeDocumentParamSchema }),
  asyncHandler(removeKnowledgeDocument)
);

export default router;
