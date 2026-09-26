import { getDatabase } from '../config/database.js';

function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at
  };
}

export const userModel = {
  create({ name, email, passwordHash }) {
    const result = getDatabase().prepare(`
      INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)
    `).run(name.trim(), email.trim().toLowerCase(), passwordHash);
    return this.findById(Number(result.lastInsertRowid));
  },

  findByEmail(email) {
    return getDatabase().prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE')
      .get(email.trim().toLowerCase()) ?? null;
  },

  findById(id) {
    return toUser(getDatabase().prepare('SELECT * FROM users WHERE id = ?').get(id));
  },

  update(id, fields) {
    const updates = [];
    const values = [];
    if (fields.name !== undefined) {
      updates.push('name = ?');
      values.push(fields.name.trim());
    }
    if (fields.email !== undefined) {
      updates.push('email = ?');
      values.push(fields.email.trim().toLowerCase());
    }
    if (!updates.length) return this.findById(id);
    values.push(id);
    getDatabase().prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }
};