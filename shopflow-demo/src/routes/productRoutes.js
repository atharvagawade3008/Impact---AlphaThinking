import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { validateIdParam } from '../middleware/validationMiddleware.js';

const router = Router();

router.get('/', productController.list);
router.get('/:id', validateIdParam, productController.getById);

export default router;