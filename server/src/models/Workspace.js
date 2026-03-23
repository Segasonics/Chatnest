import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    whatsappProvider: { type: String, enum: ['mock', 'meta', 'twilio'], default: 'mock' },
    providerConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    providerPhoneNumberId: { type: String, index: true },
    providerBusinessAccountId: { type: String, index: true },
    phoneNumber: { type: String, trim: true }
  },
  { timestamps: true }
);

export const Workspace = mongoose.model('Workspace', workspaceSchema);
