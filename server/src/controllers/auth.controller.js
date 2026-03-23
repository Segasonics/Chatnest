import { registerUser, loginUser, createSession, rotateSession, revokeSession } from '../services/auth/auth.service.js';
import { env } from '../config/env.js';

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000
  };
}

export async function register(req, res) {
  const user = await registerUser(req.body);
  const { accessToken, refreshToken } = await createSession(user, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  });

  res.cookie(env.COOKIE_NAME, refreshToken, refreshCookieOptions());
  res.status(201).json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        messageCreditsRemaining: user.messageCreditsRemaining
      }
    }
  });
}

export async function login(req, res) {
  const user = await loginUser(req.body);
  const { accessToken, refreshToken } = await createSession(user, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  });

  res.cookie(env.COOKIE_NAME, refreshToken, refreshCookieOptions());
  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        messageCreditsRemaining: user.messageCreditsRemaining
      }
    }
  });
}

export async function refresh(req, res) {
  const refreshToken = req.cookies[env.COOKIE_NAME];
  const { user, accessToken, refreshToken: nextRefresh } = await rotateSession(refreshToken, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip
  });

  res.cookie(env.COOKIE_NAME, nextRefresh, refreshCookieOptions());

  res.json({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        messageCreditsRemaining: user.messageCreditsRemaining
      }
    }
  });
}

export async function logout(req, res) {
  const refreshToken = req.cookies[env.COOKIE_NAME];
  await revokeSession(refreshToken);
  res.clearCookie(env.COOKIE_NAME, refreshCookieOptions());
  res.json({ success: true, message: 'Logged out' });
}
