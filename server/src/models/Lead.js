import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    customerNumber: { type: String, required: true, index: true },
    name: { type: String },
    interest: { type: String },
    preferredTime: { type: String },
    notes: { type: String },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['new', 'qualified', 'booked', 'lost'], default: 'new' }
  },
  { timestamps: true }
);

leadSchema.index({ workspaceId: 1, customerNumber: 1 }, { unique: true });

export const Lead = mongoose.model('Lead', leadSchema);
