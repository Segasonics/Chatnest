import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    nextId: { type: String }
  },
  { _id: false }
);

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['message', 'menu', 'capture', 'appointment', 'end'],
      required: true
    },
    prompt: { type: String, default: '' },
    options: { type: [optionSchema], default: [] },
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

const flowSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    name: { type: String, required: true, trim: true },
    nodes: { type: [nodeSchema], default: [] },
    startNodeId: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Flow = mongoose.model('Flow', flowSchema);
