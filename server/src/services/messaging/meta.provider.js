import crypto from 'crypto';
import { MessagingProvider } from './provider.interface.js';
import { ApiError } from '../../utils/apiError.js';
import { env } from '../../config/env.js';

function getMetaConfig(workspace) {
  const meta = workspace?.providerConfig?.meta || {};
  return {
    apiVersion: env.META_API_VERSION || 'v21.0',
    accessToken: meta.accessToken,
    phoneNumberId: meta.phoneNumberId || workspace?.providerPhoneNumberId
  };
}

function normalizeToPhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

function getSignatureHeader(req) {
  return req.headers['x-hub-signature-256'];
}

function verifySignature(rawBody, appSecret, signatureHeader) {
  if (!rawBody || !appSecret || !signatureHeader) return false;
  const expected = `sha256=${crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signatureHeader)));
}

export class MetaProvider extends MessagingProvider {
  async sendMessage({ workspace, to, body }) {
    const config = getMetaConfig(workspace);
    if (!config.phoneNumberId || !config.accessToken) {
      throw new ApiError(503, 'META_NOT_CONFIGURED', 'Meta provider is not configured');
    }

    const endpoint = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizeToPhone(to),
        type: 'text',
        text: { body: body || '' }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(502, 'META_SEND_FAILED', `Meta send failed: ${text}`);
    }

    const data = await response.json();
    return { providerMessageId: data?.messages?.[0]?.id || data?.message_id };
  }

  parseWebhook(req) {
    const body = req.body || {};
    const events = [];

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const phoneNumberId = value.metadata?.phone_number_id;
        for (const message of value.messages || []) {
          const text = message.text?.body || message.button?.text || message.interactive?.button_reply?.title || '';
          events.push({
            providerPhoneNumberId: phoneNumberId,
            from: message.from,
            body: text,
            mediaUrl: undefined,
            providerMessageId: message.id,
            receivedAt: new Date(message.timestamp ? Number(message.timestamp) * 1000 : Date.now())
          });
        }
      }
    }

    return events;
  }

  verifyWebhook(req) {
    const validateSignature = String(env.META_VALIDATE_SIGNATURE || 'true') === 'true';
    if (!validateSignature) return true;
    return verifySignature(req.rawBody, env.META_APP_SECRET, getSignatureHeader(req));
  }
}
