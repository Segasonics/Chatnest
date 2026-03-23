import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { parsePagination } from '../utils/pagination.js';
import { logAudit } from '../services/audit/audit.service.js';

export async function listWorkspaces(req, res) {
  const userId = req.auth.userId;
  const { limit, skip, page } = parsePagination(req.query);

  const memberships = await WorkspaceMember.find({ userId }).select('workspaceId');
  const memberWorkspaceIds = memberships.map((m) => m.workspaceId);

  const filter =
    req.auth.role === 'admin'
      ? {}
      : {
          $or: [{ ownerId: userId }, { _id: { $in: memberWorkspaceIds } }]
        };

  const [items, total] = await Promise.all([
    Workspace.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Workspace.countDocuments(filter)
  ]);

  res.json({ success: true, data: { items, page, limit, total } });
}

export async function createWorkspace(req, res) {
  const workspace = await Workspace.create({
    ownerId: req.auth.userId,
    name: req.body.name,
    whatsappProvider: req.body.whatsappProvider || 'mock',
    providerConfig: req.body.providerConfig || {},
    phoneNumber: req.body.phoneNumber
  });

  await logAudit({
    workspaceId: workspace._id,
    actorUserId: req.auth.userId,
    action: 'workspace.create',
    targetType: 'workspace',
    targetId: workspace._id.toString(),
    metadata: { name: workspace.name }
  });

  res.status(201).json({ success: true, data: workspace });
}

export async function getWorkspace(req, res) {
  res.json({ success: true, data: req.workspace });
}

export async function updateWorkspace(req, res) {
  const workspace = req.workspace;
  const isOwnerOrAdmin =
    workspace.ownerId.toString() === req.auth.userId || req.auth.role === 'admin' || req.workspaceRole === 'manager';

  if (!isOwnerOrAdmin) throw new ApiError(403, 'FORBIDDEN', 'Only owner/manager/admin can update workspace');

  Object.assign(workspace, req.body);
  await workspace.save();

  await logAudit({
    workspaceId: workspace._id,
    actorUserId: req.auth.userId,
    action: 'workspace.update',
    targetType: 'workspace',
    targetId: workspace._id.toString(),
    metadata: req.body
  });

  res.json({ success: true, data: workspace });
}

export async function deleteWorkspace(req, res) {
  const workspace = req.workspace;
  const isOwnerOrAdmin = workspace.ownerId.toString() === req.auth.userId || req.auth.role === 'admin';
  if (!isOwnerOrAdmin) throw new ApiError(403, 'FORBIDDEN', 'Only owner/admin can delete workspace');

  await Workspace.deleteOne({ _id: workspace._id });
  await WorkspaceMember.deleteMany({ workspaceId: workspace._id });

  await logAudit({
    workspaceId: workspace._id,
    actorUserId: req.auth.userId,
    action: 'workspace.delete',
    targetType: 'workspace',
    targetId: workspace._id.toString()
  });

  res.json({ success: true, message: 'Workspace deleted' });
}

export async function addTeamMember(req, res) {
  const workspace = req.workspace;
  const isOwner = workspace.ownerId.toString() === req.auth.userId || req.auth.role === 'admin';
  if (!isOwner) throw new ApiError(403, 'FORBIDDEN', 'Only owner/admin can manage team members');

  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found for given email');

  const member = await WorkspaceMember.findOneAndUpdate(
    { workspaceId: workspace._id, userId: user._id },
    { $set: { role: req.body.role } },
    { upsert: true, new: true }
  );

  await logAudit({
    workspaceId: workspace._id,
    actorUserId: req.auth.userId,
    action: 'team.add_or_update',
    targetType: 'workspaceMember',
    targetId: member._id.toString(),
    metadata: { email: user.email, role: member.role }
  });

  res.status(201).json({ success: true, data: member });
}

export async function removeTeamMember(req, res) {
  const workspace = req.workspace;
  const isOwner = workspace.ownerId.toString() === req.auth.userId || req.auth.role === 'admin';
  if (!isOwner) throw new ApiError(403, 'FORBIDDEN', 'Only owner/admin can manage team members');

  const member = await WorkspaceMember.findOneAndDelete({ _id: req.params.memberId, workspaceId: workspace._id });
  if (!member) throw new ApiError(404, 'NOT_FOUND', 'Team member not found');

  await logAudit({
    workspaceId: workspace._id,
    actorUserId: req.auth.userId,
    action: 'team.remove',
    targetType: 'workspaceMember',
    targetId: member._id.toString()
  });

  res.json({ success: true, message: 'Member removed' });
}
