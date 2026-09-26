process.env.SHOPFLOW_DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

const { initializeDatabase, getDatabase } = await import('../src/config/database.js');
const { seedDatabase } = await import('../src/db/seed.js');
const { authService } = await import('../src/services/authService.js');

export const { default: app } = await import('../src/app.js');

export function resetDatabase() {
  initializeDatabase();
  getDatabase().exec(`
    DELETE FROM payments;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM products;
    DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);
  seedDatabase();
}

export async function createTestUser(overrides = {}) {
  return authService.register({
    name: 'Test Customer',
    email: 'customer@example.com',
    password: 'secure-pass-123',
    ...overrides
  });
}