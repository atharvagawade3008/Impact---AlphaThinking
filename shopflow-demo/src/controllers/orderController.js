import { orderService } from '../services/orderService.js';

export const orderController = {
  create(request, response) {
    response.status(201).json({ order: orderService.createOrder(request.user.id, request.body.items) });
  },

  list(request, response) {
    response.json({ orders: orderService.listOrders(request.user.id) });
  },

  getById(request, response) {
    response.json({ order: orderService.getOrder(request.user.id, Number(request.params.id)) });
  }
};