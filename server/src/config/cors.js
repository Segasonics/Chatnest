import { env } from './env.js';

function buildAllowlist() {
  const raw = [env.CLIENT_URL, env.APP_URL].filter(Boolean).join(',');
  return raw
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
}

export const corsOptions = {
  // Dev-friendly: reflect request origin to support cookies across tunnels.
  // Lock this down to an allowlist for production.
  origin: true,
  credentials: true
};
