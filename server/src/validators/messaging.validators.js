import { z } from 'zod';

export const sendMessageSchema = z.object({
  to: z.string().min(4).max(30),
  body: z.string().max(4000).default(''),
  mediaUrl: z.string().url().optional(),
  conversationId: z.string().optional()
});

export const webhookParamSchema = z.object({
  workspaceId: z.string().min(1)
});
