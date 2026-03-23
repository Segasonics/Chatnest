import { Flow } from '../models/Flow.js';
import { ApiError } from '../utils/apiError.js';
import { logAudit } from '../services/audit/audit.service.js';

export async function listFlows(req, res) {
  const flows = await Flow.find({ workspaceId: req.workspace._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: flows });
}

export async function createFlow(req, res) {
  const flow = await Flow.create({ workspaceId: req.workspace._id, ...req.body });

  await logAudit({
    workspaceId: req.workspace._id,
    actorUserId: req.auth.userId,
    action: 'flow.create',
    targetType: 'flow',
    targetId: flow._id.toString(),
    metadata: { name: flow.name, nodeCount: flow.nodes.length }
  });

  res.status(201).json({ success: true, data: flow });
}

export async function updateFlow(req, res) {
  const flow = await Flow.findOneAndUpdate(
    { _id: req.params.flowId, workspaceId: req.workspace._id },
    { $set: req.body },
    { new: true }
  );

  if (!flow) throw new ApiError(404, 'NOT_FOUND', 'Flow not found');

  await logAudit({
    workspaceId: req.workspace._id,
    actorUserId: req.auth.userId,
    action: 'flow.update',
    targetType: 'flow',
    targetId: flow._id.toString(),
    metadata: req.body
  });

  res.json({ success: true, data: flow });
}

export async function deleteFlow(req, res) {
  const flow = await Flow.findOneAndDelete({ _id: req.params.flowId, workspaceId: req.workspace._id });
  if (!flow) throw new ApiError(404, 'NOT_FOUND', 'Flow not found');

  await logAudit({
    workspaceId: req.workspace._id,
    actorUserId: req.auth.userId,
    action: 'flow.delete',
    targetType: 'flow',
    targetId: flow._id.toString()
  });

  res.json({ success: true, message: 'Flow deleted' });
}
