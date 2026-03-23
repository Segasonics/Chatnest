import { z } from 'zod';

const flowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['message', 'menu', 'capture', 'appointment', 'end']),
  prompt: z.string().optional().default(''),
  options: z
    .array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        nextId: z.string().optional()
      })
    )
    .optional()
    .default([]),
  config: z.record(z.any()).optional().default({})
});

export const flowSchema = z.object({
  name: z.string().min(2).max(100),
  nodes: z.array(flowNodeSchema).min(1),
  startNodeId: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

export const flowUpdateSchema = flowSchema.partial();

export const flowParamSchema = z.object({
  flowId: z.string().min(1),
  workspaceId: z.string().min(1)
});
