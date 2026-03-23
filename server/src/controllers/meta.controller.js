import { Workspace } from '../models/Workspace.js';
import { ApiError } from '../utils/apiError.js';
import {
  exchangeMetaCodeForToken,
  fetchMetaPhoneNumberInfo
} from '../services/messaging/meta.auth.service.js';
import { env } from '../config/env.js';
import { logAudit } from '../services/audit/audit.service.js';

function buildCallbackUrl() {
  return env.PUBLIC_API_URL ? `${env.PUBLIC_API_URL.replace(/\/$/, '')}/api/webhooks/whatsapp/meta` : null;
}

export async function getMetaEmbeddedSignupConfig(req, res) {
  const workspace = req.workspace;
  const callbackUrl = buildCallbackUrl();

  res.json({
    success: true,
    data: {
      workspaceId: workspace._id,
      appId: env.META_APP_ID || null,
      configId: env.META_CONFIG_ID || null,
      apiVersion: env.META_API_VERSION,
      redirectUri: env.META_REDIRECT_URI || null,
      callbackUrl,
      verifyToken: env.META_VERIFY_TOKEN ? 'configured' : null
    }
  });
}

export async function getMetaWebhookStatus(_req, res) {
  const callbackUrl = buildCallbackUrl();
  const token = env.META_VERIFY_TOKEN;

  if (!callbackUrl || !token) {
    return res.json({
      success: true,
      data: { configured: false, reachable: false, callbackUrl, statusCode: null }
    });
  }

  const challenge = `chatnest_${Date.now()}`;
  const url = `${callbackUrl}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(
    token
  )}&hub.challenge=${encodeURIComponent(challenge)}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    const text = await response.text();
    const ok = response.status === 200 && text.trim() === challenge;

    return res.json({
      success: true,
      data: {
        configured: true,
        reachable: ok,
        callbackUrl,
        statusCode: response.status
      }
    });
  } catch (error) {
    return res.json({
      success: true,
      data: {
        configured: true,
        reachable: false,
        callbackUrl,
        statusCode: null,
        error: error.message
      }
    });
  }
}

export async function completeMetaEmbeddedSignup(req, res) {
  const workspace = req.workspace;
  const { code, accessToken: directAccessToken, phoneNumberId, businessAccountId, phoneNumber } = req.body;

  const accessToken = directAccessToken || (await exchangeMetaCodeForToken(code));
  if (!accessToken) throw new ApiError(400, 'META_ACCESS_TOKEN_MISSING', 'Could not resolve Meta access token');

  const phoneInfo = await fetchMetaPhoneNumberInfo({ accessToken, phoneNumberId });
  const displayPhone = phoneNumber || phoneInfo?.display_phone_number;

  workspace.whatsappProvider = 'meta';
  workspace.phoneNumber = displayPhone || workspace.phoneNumber;
  workspace.providerPhoneNumberId = phoneNumberId;
  workspace.providerBusinessAccountId = businessAccountId || workspace.providerBusinessAccountId;
  workspace.providerConfig = {
    ...(workspace.providerConfig || {}),
    meta: {
      ...(workspace.providerConfig?.meta || {}),
      accessToken,
      phoneNumberId,
      businessAccountId: businessAccountId || workspace.providerBusinessAccountId,
      displayPhoneNumber: displayPhone,
      verifiedName: phoneInfo?.verified_name,
      connectedAt: new Date().toISOString()
    }
  };
  await workspace.save();

  await logAudit({
    workspaceId: workspace._id,
    actorUserId: req.auth.userId,
    action: 'provider.meta.connect',
    targetType: 'workspace',
    targetId: workspace._id.toString(),
    metadata: {
      phoneNumberId,
      businessAccountId: workspace.providerBusinessAccountId
    }
  });

  res.json({
    success: true,
    data: {
      workspaceId: workspace._id,
      whatsappProvider: workspace.whatsappProvider,
      phoneNumber: workspace.phoneNumber,
      providerPhoneNumberId: workspace.providerPhoneNumberId,
      providerBusinessAccountId: workspace.providerBusinessAccountId
    }
  });
}

export async function disconnectMetaProvider(req, res) {
  const workspace = req.workspace;
  const nextConfig = { ...(workspace.providerConfig || {}) };
  delete nextConfig.meta;

  workspace.whatsappProvider = 'mock';
  workspace.phoneNumber = undefined;
  workspace.providerPhoneNumberId = undefined;
  workspace.providerBusinessAccountId = undefined;
  workspace.providerConfig = nextConfig;
  await workspace.save();

  await logAudit({
    workspaceId: workspace._id,
    actorUserId: req.auth.userId,
    action: 'provider.meta.disconnect',
    targetType: 'workspace',
    targetId: workspace._id.toString()
  });

  res.json({ success: true, message: 'Meta provider disconnected' });
}
