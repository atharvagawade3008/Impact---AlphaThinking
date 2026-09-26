import { getDatabase } from '../config/database.js';
import { orderModel } from '../models/orderModel.js';
import { productService } from './productService.js';
import { userService } from './userService.js';
import { paymentService } from './paymentService.js';
import { AppError } from '../utils/errors.js';

export const orderService = {
  createOrder(userId, requestedItems) {
    userService.getProfile(userId);
    if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
      throw new AppError(400, 'An order must contain at least one item');
    }

    const quantities = new Map();
    for (const item of requestedItems) {
      if (!Number.isInteger(item.productId) || item.productId < 1 ||
          !Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new AppError(400, 'Each item needs a positive productId and quantity');
      }
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }

    const items = [...quantities].map(([productId, quantity]) => {
      const product = productService.getProductById(productId);
      return { productId, quantity, name: product.name, priceCents: Math.round(product.price * 100) };
    });
    const totalAmountCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);

    const createOrderWithInventory = getDatabase().transaction(() => {
      for (const item of items) productService.reserveStock(item.productId, item.quantity);
      return orderModel.create(userId, totalAmountCents, items);
    });
    const order = createOrderWithInventory();
    const payment = paymentService.preparePayment(order.id, userId);
    return { ...order, payment };
  },

  listOrders(userId) {
    userService.getProfile(userId);
    return orderModel.findByUserId(userId);
  },

  getOrder(userId, orderId) {
    const order = orderModel.findById(orderId);
    if (!order || order.userId !== userId) throw new AppError(404, 'Order not found');
    return order;
  }
};