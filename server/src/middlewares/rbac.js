import { ApiError } from '../utils/apiError.js';

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'Insufficient role'));
    }
    return next();
  };
}
