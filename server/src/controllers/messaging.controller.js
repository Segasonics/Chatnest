import { ApiError } from '../utils/apiError.js';
import { Conversation } from '../models/Conversation.js';
import { getProvider } from '../services/messaging/provider.factory.js';
import { consumeWorkspaceQuota } from '../services/quota/quota.service.js';
import { logAudit } from '../services/audit/audit.service.js';

export async function sendMessage(req, res) {
  const workspace = req.workspace;
  await consumeWorkspaceQuota(workspace._id, 1);

  let conversationId = req.body.conversationId;
  if (!conversationId) {
    const convo = await Conversation.findOneAndUpdate(
      { workspaceId: workspace._id, customerNumber: req.body.to },
      { $set: { lastMessageAt: new Date() } },
      { upsert: true, new: true }
    );
    conversationId = convo._id;
  }

  const provider = getProvider(workspace);
  const result = await provider.sendMessage({
    workspace,
    to: req.body.to,
    body: req.body.body,
    mediaUrl: req.body.mediaUrl,
    conversationId
  });

  if (!result?.providerMessageId) {
    throw new ApiError(500, 'MESSAGE_SEND_FAILED', 'Provider did not return message ID');
  }

  await logAudit({
    workspaceId: workspace._id,
    actorUserId: req.auth.userId,
    action: 'message.manual_send',
    targetType: 'conversation',
    targetId: conversationId.toString(),
    metadata: { to: req.body.to }
  });

  res.status(201).json({ success: true, data: { ...result, conversationId } });
}
