import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  addTeamMember,
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  listWorkspaces,
  removeTeamMember,
  updateWorkspace
} from '../controllers/workspace.controller.js';
import {
  addWorkspaceMemberSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema
} from '../validators/workspace.validators.js';
import { requireWorkspaceAccess } from '../middlewares/workspaceAccess.js';

const router = express.Router();

router.get('/', requireAuth, asyncHandler(listWorkspaces));
router.post('/', requireAuth, validate({ body: createWorkspaceSchema }), asyncHandler(createWorkspace));
router.get('/:id', requireAuth, requireWorkspaceAccess, asyncHandler(getWorkspace));
router.patch(
  '/:id',
  requireAuth,
  requireWorkspaceAccess,
  validate({ body: updateWorkspaceSchema, params: workspaceIdParamSchema }),
  asyncHandler(updateWorkspace)
);
router.delete('/:id', requireAuth, requireWorkspaceAccess, asyncHandler(deleteWorkspace));

router.post(
  '/:id/team',
  requireAuth,
  requireWorkspaceAccess,
  validate({ body: addWorkspaceMemberSchema }),
  asyncHandler(addTeamMember)
);
router.delete('/:id/team/:memberId', requireAuth, requireWorkspaceAccess, asyncHandler(removeTeamMember));

export default router;
