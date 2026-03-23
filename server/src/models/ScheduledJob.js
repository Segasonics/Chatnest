import mongoose from 'mongoose';

const scheduledJobSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    type: { type: String, enum: ['reminder', 'followup'], required: true },
    runAt: { type: Date, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'running', 'done', 'failed', 'cancelled'], default: 'pending' }
  },
  { timestamps: true }
);

export const ScheduledJob = mongoose.model('ScheduledJob', scheduledJobSchema);
