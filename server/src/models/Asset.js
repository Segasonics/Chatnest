import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['image', 'pdf'], required: true },
    originalUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileName: { type: String, required: true },
    size: { type: Number, required: true },
    fileHash: { type: String, index: true }
  },
  { timestamps: true }
);

assetSchema.index({ workspaceId: 1, fileHash: 1 });

export const Asset = mongoose.model('Asset', assetSchema);
