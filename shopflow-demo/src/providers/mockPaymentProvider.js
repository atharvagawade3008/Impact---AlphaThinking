import { randomUUID } from 'node:crypto';

export const mockPaymentProvider = {
  async processPayment(orderId, amount) {
    return {
      status: 'succeeded',
      transactionReference: `shopflow-${orderId}-${randomUUID()}`,
      amount
    };
  },

  async refundPayment(transactionReference) {
    return {
      status: 'refunded',
      transactionReference: `refund-${transactionReference}`
    };
  }
};