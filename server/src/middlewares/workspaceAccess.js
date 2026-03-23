import mongoose from 'mongoose';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { ApiError } from '../utils/apiError.js';

export async function requireWorkspaceAccess(req, _res, next) {
  try {
    const workspaceId = req.params.id || req.params.workspaceId;
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return next(new ApiError(400, 'INVALID_WORKSPACE', 'Invalid workspace id'));
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return next(new ApiError(404, 'NOT_FOUND', 'Workspace not found'));
    }

    const userId = req.auth.userId;
    const isOwner = workspace.ownerId.toString() === userId;

    if (!isOwner) {
      const membership = await WorkspaceMember.findOne({ workspaceId, userId });
      if (!membership && req.auth.role !== 'admin') {
        return next(new ApiError(403, 'FORBIDDEN', 'No access to workspace'));
      }
      req.workspaceRole = membership?.role;
    } else {
      req.workspaceRole = 'owner';
    }

    req.workspace = workspace;
    return next();
  } catch (error) {
    return next(error);
  }
}
