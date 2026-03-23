import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createFlow, deleteFlow, listFlows, updateFlow } from '../controllers/flow.controller.js';
import { flowParamSchema, flowSchema, flowUpdateSchema } from '../validators/flows.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/', requireAuth, requireWorkspaceAccess, asyncHandler(listFlows));
router.post('/', requireAuth, requireWorkspaceAccess, validate({ body: flowSchema }), asyncHandler(createFlow));
router.patch(
  '/:flowId',
  requireAuth,
  requireWorkspaceAccess,
  validate({ body: flowUpdateSchema, params: flowParamSchema }),
  asyncHandler(updateFlow)
);
router.delete('/:flowId', requireAuth, requireWorkspaceAccess, asyncHandler(deleteFlow));

export default router;
