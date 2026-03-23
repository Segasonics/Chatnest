import { z } from 'zod';

export const createCheckoutSchema = z.object({
  plan: z.enum(['free', 'pro', 'team'])
});
