import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

function requireMetaAppConfig() {
  if (!env.META_APP_ID || !env.META_APP_SECRET) {
    throw new ApiError(503, 'META_APP_NOT_CONFIGURED', 'Meta app credentials are missing');
  }
}

export async function exchangeMetaCodeForToken(code) {
  requireMetaAppConfig();
  if (!code) throw new ApiError(400, 'MISSING_CODE', 'Meta authorization code is required');

  const url = new URL(`https://graph.facebook.com/${env.META_API_VERSION}/oauth/access_token`);
  url.searchParams.set('client_id', env.META_APP_ID);
  url.searchParams.set('client_secret', env.META_APP_SECRET);
  url.searchParams.set('code', code);
  if (env.META_REDIRECT_URI) url.searchParams.set('redirect_uri', env.META_REDIRECT_URI);

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(502, 'META_TOKEN_EXCHANGE_FAILED', `Meta token exchange failed: ${text}`);
  }

  const data = await response.json();
  return data?.access_token;
}

export async function fetchMetaPhoneNumberInfo({ accessToken, phoneNumberId }) {
  if (!accessToken || !phoneNumberId) {
    throw new ApiError(400, 'MISSING_META_FIELDS', 'Meta access token and phone number id are required');
  }

  const url = new URL(`https://graph.facebook.com/${env.META_API_VERSION}/${phoneNumberId}`);
  url.searchParams.set('fields', 'id,display_phone_number,verified_name');
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(502, 'META_PHONE_LOOKUP_FAILED', `Meta phone lookup failed: ${text}`);
  }

  return response.json();
}
