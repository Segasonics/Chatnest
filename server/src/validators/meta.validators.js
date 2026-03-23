import { z } from 'zod';

export const metaConnectSchema = z
  .object({
    code: z.string().optional(),
    accessToken: z.string().optional(),
    phoneNumberId: z.string().min(4),
    businessAccountId: z.string().min(4).optional().or(z.literal('')),
    phoneNumber: z.string().optional()
  })
  .refine((payload) => payload.code || payload.accessToken, {
    message: 'Either code or accessToken must be provided'
  });
