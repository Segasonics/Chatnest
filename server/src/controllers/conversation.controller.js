import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { ApiError } from '../utils/apiError.js';
import { parsePagination } from '../utils/pagination.js';

export async function listConversations(req, res) {
  const { limit, skip, page } = parsePagination(req.query);

  const [items, total] = await Promise.all([
    Conversation.find({ workspaceId: req.workspace._id }).sort({ lastMessageAt: -1 }).skip(skip).limit(limit),
    Conversation.countDocuments({ workspaceId: req.workspace._id })
  ]);

  res.json({ success: true, data: { items, page, limit, total } });
}

export async function getConversation(req, res) {
  const conversation = await Conversation.findOne({ _id: req.params.conversationId, workspaceId: req.workspace._id });
  if (!conversation) throw new ApiError(404, 'NOT_FOUND', 'Conversation not found');

  const messages = await Message.find({ workspaceId: req.workspace._id, conversationId: conversation._id }).sort({ createdAt: 1 });

  res.json({ success: true, data: { conversation, messages } });
}
