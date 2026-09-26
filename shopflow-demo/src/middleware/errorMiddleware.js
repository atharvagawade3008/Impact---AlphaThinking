import { AppError } from '../utils/errors.js';

export function notFoundHandler(request, response, next) {
  next(new AppError(404, `Route not found: ${request.method} ${request.path}`));
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

  const status = error instanceof AppError ? error.status : 500;
  const message = status === 500 ? 'Internal server error' : error.message;
  if (status === 500) console.error(error);
  return response.status(status).json({ error: message });
}