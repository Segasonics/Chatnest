# Chat Nest

Chat Nest is a production-ready MERN SaaS app for WhatsApp automation with workspace multi-tenancy, quota-aware messaging, Stripe subscriptions, and a premium React dashboard.

## Stack

- Frontend: React + Vite (JavaScript), TailwindCSS, Redux Toolkit + RTK Query, React Router
- Backend: Node.js, Express, MongoDB + Mongoose
- Auth: JWT access token + HttpOnly refresh cookie with rotation
- Uploads: Cloudinary adapter + Mongo metadata
- Billing: Stripe subscriptions + webhook sync
- Messaging: Provider abstraction (`mock` implemented, Meta/Twilio ready)

## Monorepo Layout

- `client/` frontend application
- `server/` backend API and services

## Environment Variables

### Server (`server/.env`)

- `NODE_ENV` `development|test|production`
- `PORT` API port (default `5000`)
- `CLIENT_URL` comma-separated CORS allowlist (ex: `http://localhost:5173`)
- `MONGO_URI` MongoDB connection string
- `JWT_ACCESS_SECRET` access token secret
- `JWT_REFRESH_SECRET` refresh token secret
- `JWT_ACCESS_EXPIRES` default `15m`
- `JWT_REFRESH_EXPIRES` default `30d`
- `COOKIE_NAME` refresh cookie name
- `COOKIE_DOMAIN` cookie domain (optional)
- `COOKIE_SECURE` `true|false`
- `COOKIE_SAME_SITE` `lax|strict|none`
- `BCRYPT_ROUNDS` default `10`
- `RATE_LIMIT_WINDOW_MS` default `900000`
- `RATE_LIMIT_MAX` default `200`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_FREE`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_TEAM`
- `TWILIO_ACCOUNT_SID` Twilio account SID
- `TWILIO_AUTH_TOKEN` Twilio auth token
- `TWILIO_WHATSAPP_FROM` sender (sandbox default `whatsapp:+14155238886`)
- `TWILIO_VALIDATE_SIGNATURE` `true|false` (set `true` for production)
- `TWILIO_WEBHOOK_BASE_URL` public HTTPS base URL for webhook signature checks
- `META_APP_ID` Meta app id for embedded signup/token exchange
- `META_APP_SECRET` Meta app secret
- `META_API_VERSION` default `v21.0`
- `META_VERIFY_TOKEN` webhook verify token used by Meta GET challenge
- `META_VALIDATE_SIGNATURE` `true|false` (enable in production)
- `META_CONFIG_ID` optional embedded signup config id
- `META_REDIRECT_URI` redirect URI configured in Meta app
- `PUBLIC_API_URL` public API base (used to show webhook callback URL in UI)
- `OPENAI_API_KEY` required for AI embedding + generated answers
- `OPENAI_CHAT_MODEL` default `gpt-4.1-mini`
- `OPENAI_EMBEDDING_MODEL` default `text-embedding-3-small`
- `RAG_TOP_K` number of retrieved chunks for answering
- `RAG_MIN_SCORE` retrieval threshold (0-1)
- `APP_URL` frontend base URL used for Stripe redirects
- `LOG_LEVEL` logger level (`info`, `debug`, etc)

### Client (`client/.env`)

- `VITE_API_URL` API base URL (ex: `http://localhost:5000/api`)
- `VITE_APP_NAME` display name
- `VITE_STRIPE_PUBLISHABLE_KEY` optional for future Stripe client usage

## Install

```bash
cd server
npm install
cd ../client
npm install
```

## Run

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

## Seed Demo Data

```bash
cd server
npm run seed
```

Demo login after seed:

- Email: `owner@chatnest.app`
- Password: `Password123!`

## Core API Groups

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`
- Users: `/api/users/me`
- Workspaces CRUD: `/api/workspaces`
- Assets: `/api/workspaces/:id/upload-asset`
- Rules: `/api/workspaces/:workspaceId/rules`
- Flows: `/api/workspaces/:workspaceId/flows`
- Conversations: `/api/workspaces/:workspaceId/conversations`
- Send Message: `/api/workspaces/:workspaceId/send`
- Webhooks: `/api/webhooks/whatsapp/:workspaceId`
- Billing: `/api/billing/create-checkout-session`, `/api/billing/webhook`, `/api/billing/me`
- Leads: `/api/workspaces/:workspaceId/leads`
- Analytics: `/api/workspaces/:workspaceId/analytics`
- Knowledge (RAG): `/api/workspaces/:workspaceId/knowledge`, `/knowledge/text`, `/knowledge/query`
- Meta connect: `/api/workspaces/:workspaceId/providers/meta/embedded-signup-config`
- Meta connect: `/api/workspaces/:workspaceId/providers/meta/complete`
- Meta disconnect: `/api/workspaces/:workspaceId/providers/meta/disconnect`
- Meta webhook verify: `GET /api/webhooks/whatsapp/meta`
- Meta webhook events: `POST /api/webhooks/whatsapp/meta`

## Production Notes

- Refresh tokens are HttpOnly cookies and are rotated on refresh.
- Quota is enforced on outbound sends and automated replies.
- In-process scheduler can be replaced by BullMQ+Redis through queue adapter boundary.
- Provider abstraction supports `mock` and `twilio` now (`meta` placeholder remains).

## RAG Quality Tips

- After upgrading extraction logic, re-upload important PDFs so they are re-indexed with improved text extraction.
- Ensure `OPENAI_API_KEY` is set for embedding + stronger answer generation.
- Use concise, text-rich PDFs (scanned image-only PDFs need OCR and may still underperform).

## Twilio Sandbox Quick Setup

1. In Twilio Console, open WhatsApp Sandbox and join from your phone.
2. Set Sandbox webhook URL to:
   - `https://<your-public-domain>/api/webhooks/whatsapp/<workspaceId>`
3. Configure server env:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886`
4. Update workspace:
   - `whatsappProvider: "twilio"`
   - optional `providerConfig` for workspace-specific Twilio creds.
