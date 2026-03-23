import { Workspace } from '../models/Workspace.js';
import { ApiError } from '../utils/apiError.js';
import { getProvider } from '../services/messaging/provider.factory.js';
import { processIncomingMessage } from '../services/messaging/automation.engine.js';
import { MetaProvider } from '../services/messaging/meta.provider.js';
import { env } from '../config/env.js';

const metaProvider = new MetaProvider();

export async function whatsappWebhook(req, res) {
  const workspace = await Workspace.findById(req.params.workspaceId);
  if (!workspace) throw new ApiError(404, 'NOT_FOUND', 'Workspace not found');

  const provider = getProvider(workspace);
  const verified = provider.verifyWebhook(req, workspace);

  if (!verified) throw new ApiError(401, 'INVALID_WEBHOOK', 'Webhook verification failed');

  const events = provider.parseWebhook(req);
  for (const event of events) {
    await processIncomingMessage({ workspace, event });
  }

  res.json({ success: true, received: events.length });
}

export async function verifyMetaWebhook(req, res) {
  const params = new URL(req.originalUrl, `http://${req.headers.host}`).searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  if (mode === 'subscribe' && token && env.META_VERIFY_TOKEN && token === env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send('Forbidden');
}

export async function metaWebhook(req, res) {
  const verified = metaProvider.verifyWebhook(req);
  if (!verified) throw new ApiError(401, 'INVALID_WEBHOOK', 'Meta webhook signature invalid');

  const events = metaProvider.parseWebhook(req);
  for (const event of events) {
    const workspace = await Workspace.findOne({
      whatsappProvider: 'meta',
      providerPhoneNumberId: event.providerPhoneNumberId
    });
    if (!workspace) continue;

    await processIncomingMessage({ workspace, event });
  }

  res.json({ success: true, received: events.length });
}
