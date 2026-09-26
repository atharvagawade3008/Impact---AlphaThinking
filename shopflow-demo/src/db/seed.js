import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { initializeDatabase, getDatabase } from '../config/database.js';

const products = [
  ['Mechanical Keyboard', 'Hot-swappable 75% keyboard with tactile switches.', 8999, 24],
  ['Wireless Mouse', 'Ergonomic wireless mouse with adjustable DPI.', 4299, 38],
  ['USB-C Dock', 'Compact dock with HDMI, Ethernet, and 100W pass-through.', 12999, 12],
  ['Laptop Stand', 'Foldable aluminum stand for desk or travel.', 3599, 31],
  ['Noise-Canceling Headphones', 'Over-ear headphones with USB-C charging.', 15999, 9]
];

export function seedDatabase() {
  initializeDatabase();
  const insertProduct = getDatabase().prepare(`
    INSERT INTO products (name, description, price_cents, stock)
    SELECT @name, @description, @priceCents, @stock
    WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = @name)
  `);

  for (const [name, description, priceCents, stock] of products) {
    insertProduct.run({ name, description, priceCents, stock });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  seedDatabase();
  console.log('ShopFlow database seeded.');
}