import { logger } from '../config/logger.js';

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  if (statusCode >= 500) {
    logger.error({ err }, 'Unhandled server error');
  }

  res.status(statusCode).json({
    success: false,
    code,
    message: err.message || 'Something went wrong',
    details: err.details
  });
}
