import { getDatabase } from '../config/database.js';

function toOrder(row, items = []) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    totalAmount: row.total_amount_cents / 100,
    createdAt: row.created_at,
    items
  };
}

function toItem(row) {
  return {
    productId: row.product_id,
    name: row.product_name,
    quantity: row.quantity,
    price: row.price_cents / 100
  };
}

function getItems(orderId) {
  return getDatabase().prepare(`
    SELECT product_id, product_name, quantity, price_cents
    FROM order_items WHERE order_id = ? ORDER BY id
  `).all(orderId).map(toItem);
}

export const orderModel = {
  create(userId, totalAmountCents, items) {
    const database = getDatabase();
    const result = database.prepare(`
      INSERT INTO orders (user_id, total_amount_cents) VALUES (?, ?)
    `).run(userId, totalAmountCents);
    const orderId = Number(result.lastInsertRowid);
    const insertItem = database.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, price_cents)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const item of items) {
      insertItem.run(orderId, item.productId, item.name, item.quantity, item.priceCents);
    }
    return this.findById(orderId);
  },

  findById(id) {
    const row = getDatabase().prepare('SELECT * FROM orders WHERE id = ?').get(id);
    return row ? toOrder(row, getItems(id)) : null;
  },

  findByUserId(userId) {
    const rows = getDatabase().prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC
    `).all(userId);
    return rows.map((row) => toOrder(row, getItems(row.id)));
  },

  updateStatus(id, status) {
    getDatabase().prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    return this.findById(id);
  }
};