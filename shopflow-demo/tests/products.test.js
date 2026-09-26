import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDatabase } from './helpers.js';

beforeEach(resetDatabase);

test('lists, searches, and retrieves seeded products', async () => {
  const listing = await request(app).get('/api/products').expect(200);
  assert.equal(listing.body.products.length, 5);

  const search = await request(app).get('/api/products?q=keyboard').expect(200);
  assert.equal(search.body.products[0].name, 'Mechanical Keyboard');

  const product = await request(app).get('/api/products/1').expect(200);
  assert.equal(product.body.product.price, 89.99);
  await request(app).get('/api/products/999').expect(404);
});