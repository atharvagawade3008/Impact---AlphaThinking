import { paymentService } from '../services/paymentService.js';

export const paymentController = {
  async process(request, response) {
    const payment = await paymentService.processPayment(
      request.body.orderId,
      request.body.amount,
      request.user.id
    );
    response.json({ payment });
  },

  getById(request, response) {
    response.json({ payment: paymentService.getPayment(request.user.id, Number(request.params.id)) });
  },

  async refund(request, response) {
    response.json({ payment: await paymentService.refundPayment(request.user.id, Number(request.params.id)) });
  }
};