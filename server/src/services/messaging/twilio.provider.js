import crypto from 'crypto';
import { MessagingProvider } from './provider.interface.js';
import { ApiError } from '../../utils/apiError.js';
import { env } from '../../config/env.js';

// Ensures outbound numbers use Twilio's required `whatsapp:` prefix.
function normalizeToWhatsAppAddress(value) {
  if (!value) return value;
  if (value.startsWith('whatsapp:')) return value;
  return `whatsapp:${value}`;
}

// Normalizes inbound sender to a plain phone format for internal models.
function normalizeFromWhatsAppAddress(value) {
  if (!value) return value;
  return value.replace(/^whatsapp:/i, '');
}

// Builds the exact URL Twilio signs for webhook validation.
function buildWebhookUrl(req, workspace) {
  const configuredBase =
    workspace?.providerConfig?.twilioWebhookBaseUrl || env.TWILIO_WEBHOOK_BASE_URL || '';

  if (configuredBase) {
    const base = configuredBase.replace(/\/$/, '');
    const path = req.originalUrl.startsWith('/') ? req.originalUrl : `/${req.originalUrl}`;
    return `${base}${path}`;
  }

  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host');
  return `${protocol}://${host}${req.originalUrl}`;
}

// Recreates Twilio's HMAC-SHA1 signature from URL + form params.
function computeTwilioSignature(authToken, url, params) {
  const sortedKeys = Object.keys(params || {}).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + String(params[key]);
  }
  return crypto.createHmac('sha1', authToken).update(data, 'utf8').digest('base64');
}

// Resolves provider credentials from workspace override first, then global env.
function getTwilioConfig(workspace) {
  const providerConfig = workspace?.providerConfig || {};
  return {
    accountSid: providerConfig.twilioAccountSid || env.TWILIO_ACCOUNT_SID,
    authToken: providerConfig.twilioAuthToken || env.TWILIO_AUTH_TOKEN,
    from: providerConfig.twilioWhatsAppFrom || env.TWILIO_WHATSAPP_FROM,
    validateSignature:
      String(providerConfig.twilioValidateSignature ?? env.TWILIO_VALIDATE_SIGNATURE) === 'true'
  };
}

export class TwilioProvider extends MessagingProvider {
  // Sends outbound WhatsApp messages through Twilio's Messages API.
  async sendMessage({ workspace, to, body, mediaUrl }) {
    const config = getTwilioConfig(workspace);
    if (!config.accountSid || !config.authToken || !config.from) {
      throw new ApiError(
        503,
        'TWILIO_NOT_CONFIGURED',
        'Twilio provider is not configured for this workspace'
      );
    }

    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const payload = new URLSearchParams();
    payload.set('From', normalizeToWhatsAppAddress(config.from));
    payload.set('To', normalizeToWhatsAppAddress(to));
    payload.set('Body', body || '');
    if (mediaUrl) payload.set('MediaUrl', mediaUrl);

    const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: payload.toString()
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(502, 'TWILIO_SEND_FAILED', `Twilio send failed: ${text}`);
    }

    const data = await response.json();
    return { providerMessageId: data.sid };
  }

  // Converts Twilio inbound webhook payload into the app's normalized event format.
  parseWebhook(req) {
    const body = req.body || {};
    const mediaCount = Number(body.NumMedia || 0);
    const mediaUrl = mediaCount > 0 ? body.MediaUrl0 : undefined;

    if (!body.From && !body.WaId) return [];

    return [
      {
        from: normalizeFromWhatsAppAddress(body.From || body.WaId),
        body: body.Body || '',
        mediaUrl,
        providerMessageId: body.MessageSid || body.SmsSid || body.SmsMessageSid,
        receivedAt: new Date()
      }
    ];
  }

  // Validates inbound webhook authenticity via X-Twilio-Signature (if enabled).
  verifyWebhook(req, workspace) {
    const config = getTwilioConfig(workspace);
    if (!config.validateSignature) return true;
    if (!config.authToken) return false;

    const signature = req.headers['x-twilio-signature'];
    if (!signature) return false;

    const url = buildWebhookUrl(req, workspace);
    const expected = computeTwilioSignature(config.authToken, url, req.body || {});
    return signature === expected;
  }
}
