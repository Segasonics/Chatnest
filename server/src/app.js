import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { applySecurity } from './middlewares/security.js';
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { billingWebhook } from './controllers/billing.controller.js';

const app = express();

// Required behind ngrok/reverse proxies so rate-limit and req.ip work correctly.
app.set('trust proxy', 1);

app.use(requestLogger);
applySecurity(app);
// Dev-friendly CORS: reflect request origin and allow credentials.
// Replace with allowlist-based corsOptions for production.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'authorization,content-type,ngrok-skip-browser-warning'
    );
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), asyncHandler(billingWebhook));
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', apiRateLimiter, routes);

app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
