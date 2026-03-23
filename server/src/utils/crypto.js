import crypto from 'crypto';

export function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function generateRandomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}
