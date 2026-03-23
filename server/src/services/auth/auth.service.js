import bcrypt from 'bcryptjs';
import { User } from '../../models/User.js';
import { RefreshSession } from '../../models/RefreshSession.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from './token.service.js';
import { hashValue } from '../../utils/crypto.js';
import { ApiError } from '../../utils/apiError.js';
import { env } from '../../config/env.js';
import { PLAN_QUOTAS } from '../../constants/quotas.js';

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'EMAIL_TAKEN', 'Email is already in use');

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const user = await User.create({
    name,
    email,
    passwordHash,
    messageCreditsRemaining: PLAN_QUOTAS.free
  });
  return user;
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }
  return user;
}

export async function createSession(user, meta = {}) {
  const accessToken = createAccessToken(user);
  const { token: refreshToken } = createRefreshToken(user._id.toString());
  const hash = hashValue(refreshToken);

  const payload = verifyRefreshToken(refreshToken);
  await RefreshSession.create({
    userId: user._id,
    tokenHash: hash,
    expiresAt: new Date(payload.exp * 1000),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress
  });

  return { accessToken, refreshToken };
}

export async function rotateSession(refreshToken, meta = {}) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'INVALID_REFRESH', 'Invalid refresh token');
  }

  const currentHash = hashValue(refreshToken);
  const session = await RefreshSession.findOne({
    tokenHash: currentHash,
    userId: payload.userId,
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    throw new ApiError(401, 'INVALID_REFRESH', 'Refresh token revoked or expired');
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new ApiError(401, 'INVALID_REFRESH', 'User not found');
  }

  await RefreshSession.deleteOne({ _id: session._id });

  const newTokens = await createSession(user, meta);
  return { user, ...newTokens };
}

export async function revokeSession(refreshToken) {
  if (!refreshToken) return;
  const hash = hashValue(refreshToken);
  await RefreshSession.deleteOne({ tokenHash: hash });
}
