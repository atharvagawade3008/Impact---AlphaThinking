import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validateBody, isEmail } from '../middleware/validationMiddleware.js';

const router = Router();

router.post('/register', validateBody({
  name: { validate: (value) => typeof value === 'string' && value.trim().length > 0 ? null : 'name must be a non-empty string' },
  email: { validate: (value) => isEmail(value) ? null : 'email must be valid' },
  password: { validate: (value) => typeof value === 'string' && value.length >= 8 ? null : 'password must be at least 8 characters' }
}), authController.register);
router.post('/login', validateBody({
  email: { validate: (value) => isEmail(value) ? null : 'email must be valid' },
  password: { validate: (value) => typeof value === 'string' && value.length > 0 ? null : 'password is required' }
}), authController.login);

export default router;