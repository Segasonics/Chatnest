import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument',
      required: true,
      index: true
    },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], default: [] },
    tokenCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

knowledgeChunkSchema.index({ workspaceId: 1, documentId: 1, chunkIndex: 1 }, { unique: true });

export const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
