import { ApiError } from '../utils/apiError.js';

export function validate(schemas = {}) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      next();
    } catch (error) {
      return next(new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', error.flatten?.()));
    }
  };
}
