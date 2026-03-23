import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    direction: { type: String, enum: ['in', 'out'], required: true },
    body: { type: String, default: '' },
    mediaUrl: { type: String },
    providerMessageId: { type: String },
    triggerMatched: { type: String }
  },
  { timestamps: true }
);

messageSchema.index({ workspaceId: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
