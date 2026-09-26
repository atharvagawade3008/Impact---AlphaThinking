import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, createTestUser, resetDatabase } from './helpers.js';

beforeEach(resetDatabase);

test('creates an owned order, reserves inventory, and prepares its payment', async () => {
  const { token } = await createTestUser();
  const result = await request(app).post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ items: [{ productId: 1, quantity: 2 }] }).expect(201);

  const { order } = result.body;
  assert.equal(order.totalAmount, 179.98);
  assert.equal(order.status, 'pending');
  assert.equal(order.payment.status, 'pending');
  assert.equal(order.items[0].quantity, 2);

  const product = await request(app).get('/api/products/1').expect(200);
  assert.equal(product.body.product.stock, 22);
  await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`)
    .expect(200).expect(({ body }) => assert.equal(body.orders.length, 1));
});

test('rolls inventory back when any requested item is unavailable', async () => {
  const { token } = await createTestUser();
  await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`)
    .send({ items: [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 999 }] })
    .expect(409);

  const product = await request(app).get('/api/products/1').expect(200);
  assert.equal(product.body.product.stock, 24);
});