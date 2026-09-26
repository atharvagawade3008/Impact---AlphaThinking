import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, resetDatabase } from './helpers.js';

beforeEach(resetDatabase);

test('registers, hashes credentials, logs in, and protects the profile route', async () => {
  const registered = await request(app).post('/api/auth/register').send({
    name: 'Avery Customer', email: 'avery@example.com', password: 'secure-pass-123'
  }).expect(201);

  assert.ok(registered.body.token);
  assert.equal(registered.body.user.email, 'avery@example.com');
  assert.equal('passwordHash' in registered.body.user, false);

  const profile = await request(app).get('/api/users/me')
    .set('Authorization', `Bearer ${registered.body.token}`).expect(200);
  assert.equal(profile.body.user.name, 'Avery Customer');

  const updatedProfile = await request(app).put('/api/users/me')
    .set('Authorization', `Bearer ${registered.body.token}`)
    .send({ name: 'Avery Updated' }).expect(200);
  assert.equal(updatedProfile.body.user.name, 'Avery Updated');

  const login = await request(app).post('/api/auth/login')
    .send({ email: 'avery@example.com', password: 'secure-pass-123' }).expect(200);
  assert.ok(login.body.token);
  await request(app).get('/api/users/me').expect(401);
  await request(app).post('/api/auth/login')
    .send({ email: 'avery@example.com', password: 'incorrect-pass' }).expect(401);
});

test('rejects invalid registration input and duplicate email addresses', async () => {
  await request(app).post('/api/auth/register')
    .send({ name: 'Avery', email: 'not-an-email', password: 'short' }).expect(400);
  const user = { name: 'Avery', email: 'avery@example.com', password: 'secure-pass-123' };
  await request(app).post('/api/auth/register').send(user).expect(201);
  await request(app).post('/api/auth/register').send(user).expect(409);
});