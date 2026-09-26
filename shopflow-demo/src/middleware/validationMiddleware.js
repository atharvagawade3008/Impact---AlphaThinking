import { AppError } from '../utils/errors.js';

export function validateBody(fields) {
  return (request, response, next) => {
    const body = request.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return next(new AppError(400, 'Request body must be a JSON object'));
    }

    for (const [field, rules] of Object.entries(fields)) {
      const value = body[field];
      if ((value === undefined || value === null || value === '') && !rules.optional) {
        return next(new AppError(400, `${field} is required`));
      }
      if (value === undefined || value === null || value === '') continue;
      const problem = rules.validate?.(value);
      if (problem) return next(new AppError(400, problem));
    }
    return next();
  };
}

export function validateIdParam(request, response, next) {
  if (!Number.isInteger(Number(request.params.id)) || Number(request.params.id) < 1) {
    return next(new AppError(400, 'id must be a positive integer'));
  }
  return next();
}

export const isEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;