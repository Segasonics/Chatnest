import mongoose from 'mongoose';

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    sourceType: { type: String, enum: ['asset', 'manual'], required: true },
    sourceAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'indexed', 'failed'], default: 'pending' },
    contentPreview: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    chunkCount: { type: Number, default: 0 },
    lastIndexedAt: { type: Date }
  },
  { timestamps: true }
);

knowledgeDocumentSchema.index({ workspaceId: 1, createdAt: -1 });

export const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
