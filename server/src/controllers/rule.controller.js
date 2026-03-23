import { Rule } from '../models/Rule.js';
import { ApiError } from '../utils/apiError.js';
import { logAudit } from '../services/audit/audit.service.js';

function validateRegexRule(rule) {
  if (rule.triggerType !== 'regex') return;
  try {
    new RegExp(rule.triggerValue);
  } catch {
    throw new ApiError(400, 'INVALID_REGEX', 'Invalid regex trigger pattern');
  }
}

export async function listRules(req, res) {
  const rules = await Rule.find({ workspaceId: req.workspace._id })
    .populate('responseAssetId', 'fileName originalUrl type')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: rules });
}

export async function createRule(req, res) {
  validateRegexRule(req.body);
  const rule = await Rule.create({ workspaceId: req.workspace._id, ...req.body });

  await logAudit({
    workspaceId: req.workspace._id,
    actorUserId: req.auth.userId,
    action: 'rule.create',
    targetType: 'rule',
    targetId: rule._id.toString(),
    metadata: { triggerType: rule.triggerType, triggerValue: rule.triggerValue }
  });

  res.status(201).json({ success: true, data: rule });
}

export async function updateRule(req, res) {
  if (req.body.triggerType === 'regex' || req.body.triggerValue) {
    validateRegexRule({
      triggerType: req.body.triggerType || 'regex',
      triggerValue: req.body.triggerValue
    });
  }

  const rule = await Rule.findOneAndUpdate(
    { _id: req.params.ruleId, workspaceId: req.workspace._id },
    { $set: req.body },
    { new: true }
  );

  if (!rule) throw new ApiError(404, 'NOT_FOUND', 'Rule not found');

  await logAudit({
    workspaceId: req.workspace._id,
    actorUserId: req.auth.userId,
    action: 'rule.update',
    targetType: 'rule',
    targetId: rule._id.toString(),
    metadata: req.body
  });

  res.json({ success: true, data: rule });
}

export async function deleteRule(req, res) {
  const rule = await Rule.findOneAndDelete({ _id: req.params.ruleId, workspaceId: req.workspace._id });
  if (!rule) throw new ApiError(404, 'NOT_FOUND', 'Rule not found');

  await logAudit({
    workspaceId: req.workspace._id,
    actorUserId: req.auth.userId,
    action: 'rule.delete',
    targetType: 'rule',
    targetId: rule._id.toString()
  });

  res.json({ success: true, message: 'Rule deleted' });
}
