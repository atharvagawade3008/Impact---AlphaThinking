import { orderModel } from '../models/orderModel.js';
import { paymentModel } from '../models/paymentModel.js';
import { mockPaymentProvider } from '../providers/mockPaymentProvider.js';
import { AppError } from '../utils/errors.js';

function getOwnedOrder(orderId, userId) {
  const order = orderModel.findById(orderId);
  if (!order || order.userId !== userId) throw new AppError(404, 'Order not found');
  return order;
}

export const paymentService = {
  preparePayment(orderId, userId) {
    const order = getOwnedOrder(orderId, userId);
    const existing = paymentModel.findByOrderId(orderId);
    return existing || paymentModel.create({
      orderId,
      amountCents: Math.round(order.totalAmount * 100)
    });
  },

  async processPayment(orderId, amount, userId) {
    const order = getOwnedOrder(orderId, userId);
    if (order.status === 'refunded') throw new AppError(409, 'This order has been refunded');
    const amountCents = Math.round(order.totalAmount * 100);
    if (amount !== undefined && (!Number.isFinite(amount) || Math.round(amount * 100) !== amountCents)) {
      throw new AppError(400, 'Payment amount must match the order total');
    }

    const existing = paymentModel.findByOrderId(orderId);
    if (existing?.status === 'succeeded') return existing;
    const payment = existing || paymentModel.create({ orderId, amountCents });
    const result = await mockPaymentProvider.processPayment(orderId, amountCents / 100);
    const completedPayment = paymentModel.updateStatus(
      payment.id,
      result.status,
      result.transactionReference
    );
    orderModel.updateStatus(orderId, 'paid');
    return completedPayment;
  },

  getPayment(userId, paymentId) {
    const payment = paymentModel.findById(paymentId);
    if (!payment) throw new AppError(404, 'Payment not found');
    getOwnedOrder(payment.orderId, userId);
    return payment;
  },

  async refundPayment(userId, paymentId) {
    const payment = this.getPayment(userId, paymentId);
    if (payment.status !== 'succeeded') throw new AppError(409, 'Only completed payments can be refunded');
    const result = await mockPaymentProvider.refundPayment(payment.transactionReference);
    const refundedPayment = paymentModel.updateStatus(
      payment.id,
      result.status,
      result.transactionReference
    );
    orderModel.updateStatus(payment.orderId, 'refunded');
    return refundedPayment;
  }
};