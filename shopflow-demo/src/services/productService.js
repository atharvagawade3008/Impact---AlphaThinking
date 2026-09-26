import { productModel } from '../models/productModel.js';
import { AppError } from '../utils/errors.js';

export const productService = {
  listProducts(options) {
    return productModel.list(options);
  },

  getProductById(id) {
    const product = productModel.findById(id);
    if (!product) throw new AppError(404, 'Product not found');
    return product;
  },

  reserveStock(productId, quantity) {
    if (!productModel.decreaseStock(productId, quantity)) {
      throw new AppError(409, 'Product is unavailable or has insufficient stock');
    }
  }
};