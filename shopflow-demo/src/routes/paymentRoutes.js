import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody, validateIdParam, isPositiveInteger } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(requireAuth);
router.post('/', validateBody({
  orderId: { validate: (value) => isPositiveInteger(value) ? null : 'orderId must be a positive integer' },
  amount: { optional: true, validate: (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? null : 'amount must be a non-negative number' }
}), paymentController.process);
router.get('/:id', validateIdParam, paymentController.getById);
router.post('/:id/refund', validateIdParam, paymentController.refund);

export default router;