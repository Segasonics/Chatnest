import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const allowlistSchema = z
  .string()
  .min(1)
  .refine((value) => {
    const parts = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!parts.length) return false;
    if (parts.includes('*')) return true;
    return parts.every((item) => {
      try {
        new URL(item);
        return true;
      } catch {
        return false;
      }
    });
  }, 'Must be a valid URL or a comma-separated list of URLs');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: allowlistSchema,
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('30d'),
  COOKIE_NAME: z.string().default('chatnest_rt'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.string().default('false'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  BCRYPT_ROUNDS: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default('chatnest'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_FREE: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_PRICE_TEAM: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  TWILIO_VALIDATE_SIGNATURE: z.string().default('false'),
  TWILIO_WEBHOOK_BASE_URL: z.string().optional(),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_API_VERSION: z.string().default('v21.0'),
  META_VERIFY_TOKEN: z.string().optional(),
  META_VALIDATE_SIGNATURE: z.string().default('false'),
  META_CONFIG_ID: z.string().optional(),
  META_REDIRECT_URI: z.string().optional(),
  PUBLIC_API_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_CHAT_MODEL: z.string().default('gpt-4.1-mini'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  RAG_TOP_K: z.coerce.number().default(5),
  RAG_MIN_SCORE: z.coerce.number().default(0.2),
  APP_URL: allowlistSchema,
  LOG_LEVEL: z.string().default('info')
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

export const env = {
  ...data,
  isProd: data.NODE_ENV === 'production',
  cookieSecure: data.COOKIE_SECURE === 'true'
};
