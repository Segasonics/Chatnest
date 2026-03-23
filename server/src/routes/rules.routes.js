import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createRule, deleteRule, listRules, updateRule } from '../controllers/rule.controller.js';
import { ruleParamSchema, ruleSchema, ruleUpdateSchema } from '../validators/rules.validators.js';

const router = express.Router({ mergeParams: true });

router.get('/', requireAuth, requireWorkspaceAccess, asyncHandler(listRules));
router.post('/', requireAuth, requireWorkspaceAccess, validate({ body: ruleSchema }), asyncHandler(createRule));
router.patch(
  '/:ruleId',
  requireAuth,
  requireWorkspaceAccess,
  validate({ body: ruleUpdateSchema, params: ruleParamSchema }),
  asyncHandler(updateRule)
);
router.delete('/:ruleId', requireAuth, requireWorkspaceAccess, asyncHandler(deleteRule));

export default router;
