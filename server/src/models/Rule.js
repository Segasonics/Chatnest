import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    triggerType: { type: String, enum: ['keyword', 'contains', 'regex'], required: true },
    triggerValue: { type: String, required: true },
    responseType: { type: String, enum: ['text', 'asset', 'template'], default: 'text' },
    responseText: { type: String, default: '' },
    responseAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ruleSchema.index({ workspaceId: 1, triggerType: 1, triggerValue: 1 });

export const Rule = mongoose.model('Rule', ruleSchema);
