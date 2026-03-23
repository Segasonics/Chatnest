import { z } from 'zod';

export const workspaceIdParamSchema = z.object({
  id: z.string().min(1)
});

export const workspaceIdAltParamSchema = z.object({
  workspaceId: z.string().min(1)
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(80),
  whatsappProvider: z.enum(['mock', 'meta', 'twilio']).default('mock'),
  phoneNumber: z.string().min(4).max(30).optional(),
  providerConfig: z.record(z.any()).optional()
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const addWorkspaceMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['manager', 'member']).default('member')
});
