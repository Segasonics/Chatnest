import { z } from 'zod';

const triggerSchema = z
  .string()
  .min(1)
  .max(200)
  .refine((value) => value.trim().length > 0, 'Trigger is required');

export const ruleSchema = z.object({
  triggerType: z.enum(['keyword', 'contains', 'regex']),
  triggerValue: triggerSchema,
  responseType: z.enum(['text', 'asset', 'template']).default('text'),
  responseText: z.string().max(4000).optional().default(''),
  responseAssetId: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

export const ruleUpdateSchema = ruleSchema.partial();

export const ruleParamSchema = z.object({
  ruleId: z.string().min(1),
  workspaceId: z.string().min(1)
});
