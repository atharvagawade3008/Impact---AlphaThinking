import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, createTestUser, resetDatabase } from './helpers.js';

beforeEach(resetDatabase);

test('processes, retrieves, and refunds an order payment', async () => {
  const { token } = await createTestUser();
  const orderResponse = await request(app).post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ items: [{ productId: 2, quantity: 1 }] }).expect(201);
  const order = orderResponse.body.order;

  await request(app).post('/api/payments').set('Authorization', `Bearer ${token}`)
    .send({ orderId: order.id, amount: 1 }).expect(400);
  const paid = await request(app).post('/api/payments').set('Authorization', `Bearer ${token}`)
    .send({ orderId: order.id }).expect(200);
  assert.equal(paid.body.payment.status, 'succeeded');
  assert.ok(paid.body.payment.transactionReference);

  await request(app).get(`/api/payments/${paid.body.payment.id}`)
    .set('Authorization', `Bearer ${token}`).expect(200);
  const refunded = await request(app).post(`/api/payments/${paid.body.payment.id}/refund`)
    .set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(refunded.body.payment.status, 'refunded');

  const updatedOrder = await request(app).get(`/api/orders/${order.id}`)
    .set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(updatedOrder.body.order.status, 'refunded');
});