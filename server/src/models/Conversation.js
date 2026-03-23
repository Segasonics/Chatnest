import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    customerNumber: { type: String, required: true, index: true },
    lastMessageAt: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    state: {
      activeFlowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flow' },
      currentNodeId: { type: String },
      captureMode: { type: String, enum: ['none', 'lead_name', 'lead_interest', 'lead_time'], default: 'none' },
      appointmentPending: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

conversationSchema.index({ workspaceId: 1, customerNumber: 1 }, { unique: true });

export const Conversation = mongoose.model('Conversation', conversationSchema);
