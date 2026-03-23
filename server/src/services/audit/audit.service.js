import { AuditLog } from '../../models/AuditLog.js';

export async function logAudit({ workspaceId, actorUserId, action, targetType, targetId, metadata }) {
  await AuditLog.create({
    workspaceId,
    actorUserId,
    action,
    targetType,
    targetId,
    metadata
  });
}
