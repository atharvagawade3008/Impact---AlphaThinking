import { getDatabase } from '../config/database.js';

function toPayment(row) {
  if (!row) return null;
  return {
    id: row.id,
    orderId: row.order_id,
    amount: row.amount_cents / 100,
    status: row.status,
    transactionReference: row.transaction_reference,
    createdAt: row.created_at
  };
}

export const paymentModel = {
  create({ orderId, amountCents }) {
    const result = getDatabase().prepare(`
      INSERT INTO payments (order_id, amount_cents, status) VALUES (?, ?, 'pending')
    `).run(orderId, amountCents);
    return this.findById(Number(result.lastInsertRowid));
  },

  findById(id) {
    return toPayment(getDatabase().prepare('SELECT * FROM payments WHERE id = ?').get(id));
  },

  findByOrderId(orderId) {
    return toPayment(getDatabase().prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId));
  },

  updateStatus(id, status, transactionReference) {
    getDatabase().prepare(`
      UPDATE payments SET status = ?, transaction_reference = ? WHERE id = ?
    `).run(status, transactionReference, id);
    return this.findById(id);
  }
};