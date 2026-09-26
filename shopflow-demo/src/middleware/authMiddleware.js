import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

export function requireAuth(request, response, next) {
  const authorization = request.get('authorization');
  const [scheme, token] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'Authentication token required'));
  }

  try {
    request.user = verifyToken(token);
    return next();
  } catch {
    return next(new AppError(401, 'Invalid or expired authentication token'));
  }
}