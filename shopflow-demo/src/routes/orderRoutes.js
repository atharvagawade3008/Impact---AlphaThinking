import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody, validateIdParam, isPositiveInteger } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(requireAuth);
router.post('/', validateBody({
  items: {
    validate: (value) => Array.isArray(value) && value.length > 0 && value.every((item) =>
      item && isPositiveInteger(item.productId) && isPositiveInteger(item.quantity)
    ) ? null : 'items must contain productId and positive quantity values'
  }
}), orderController.create);
router.get('/', orderController.list);
router.get('/:id', validateIdParam, orderController.getById);

export default router;