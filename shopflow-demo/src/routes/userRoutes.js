import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody, isEmail } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(requireAuth);
router.get('/me', userController.getProfile);
router.put('/me', validateBody({
  name: { optional: true, validate: (value) => typeof value === 'string' && value.trim() ? null : 'name must be a non-empty string' },
  email: { optional: true, validate: (value) => isEmail(value) ? null : 'email must be valid' }
}), userController.updateProfile);

export default router;