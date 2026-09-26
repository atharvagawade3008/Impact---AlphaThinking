import { getDatabase } from '../config/database.js';

function toProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price_cents / 100,
    stock: row.stock
  };
}

export const productModel = {
  list({ search = '', limit = 20, offset = 0 } = {}) {
    const rows = getDatabase().prepare(`
      SELECT * FROM products
      WHERE name LIKE ? OR description LIKE ?
      ORDER BY id LIMIT ? OFFSET ?
    `).all(`%${search}%`, `%${search}%`, limit, offset);
    return rows.map(toProduct);
  },

  findById(id) {
    return toProduct(getDatabase().prepare('SELECT * FROM products WHERE id = ?').get(id));
  },

  decreaseStock(id, quantity) {
    return getDatabase().prepare(`
      UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
    `).run(quantity, id, quantity).changes > 0;
  }
};