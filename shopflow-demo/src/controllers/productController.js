import { productService } from '../services/productService.js';

export const productController = {
  list(request, response) {
    const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100);
    const offset = Math.max(Number(request.query.offset) || 0, 0);
    response.json({
      products: productService.listProducts({
        search: String(request.query.q || '').slice(0, 100),
        limit,
        offset
      })
    });
  },

  getById(request, response) {
    response.json({ product: productService.getProductById(Number(request.params.id)) });
  }
};