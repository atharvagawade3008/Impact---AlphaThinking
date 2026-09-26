import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDatabase } from './helpers.js';

beforeEach(resetDatabase);

test('customer can register, browse, order, pay, and retrieve order history', async () => {
  const registration = await request(app).post('/api/auth/register').send({
    name: 'Flow Customer', email: 'flow@example.com', password: 'secure-pass-123'
  }).expect(201);
  const authorization = { Authorization: `Bearer ${registration.body.token}` };

  const catalog = await request(app).get('/api/products?q=mouse').expect(200);
  const mouse = catalog.body.products[0];
  assert.equal(mouse.name, 'Wireless Mouse');

  const created = await request(app).post('/api/orders').set(authorization)
    .send({ items: [{ productId: mouse.id, quantity: 1 }] }).expect(201);
  const paid = await request(app).post('/api/payments').set(authorization)
    .send({ orderId: created.body.order.id }).expect(200);
  assert.equal(paid.body.payment.status, 'succeeded');

  const history = await request(app).get('/api/orders').set(authorization).expect(200);
  assert.equal(history.body.orders[0].status, 'paid');
  assert.equal(history.body.orders[0].items[0].name, 'Wireless Mouse');
});