// API tests for registration/login (FR-07) and password policy (NFR-03).
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { makeApp, PASSWORD } = require('./helpers');

describe('auth API (FR-07, NFR-03)', () => {
  let app;
  let repos;
  beforeEach(() => ({ app, repos } = makeApp()));

  test('registers a citizen and stores only a salted hash', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'Ann@Example.com', password: PASSWORD }).expect(201);
    expect(res.body).toMatchObject({ email: 'ann@example.com', role: 'CITIZEN' });

    const stored = await repos.userRepo.findByEmail('ann@example.com');
    expect(stored.passwordHash).not.toBe(PASSWORD);
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$10\$/);
    expect(await bcrypt.compare(PASSWORD, stored.passwordHash)).toBe(true);
  });

  test.each(['short1A', 'alllowercase1', 'ALLUPPERCASE1', 'NoNumbersHere'])('rejects non-compliant password %s', async (password) => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.co', password }).expect(400);
    expect(res.body.error.fields).toHaveProperty('password');
  });

  test('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@b.co', password: PASSWORD }).expect(201);
    await request(app).post('/api/auth/register').send({ email: 'a@b.co', password: PASSWORD }).expect(409);
  });

  test('self-registration cannot request a staff role', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@b.co', password: PASSWORD, role: 'ADMIN' }).expect(201);
    expect(res.body.role).toBe('CITIZEN');
  });

  test('login returns a token for correct credentials', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@b.co', password: PASSWORD });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: PASSWORD }).expect(200);
    expect(res.body.token).toBeTruthy();
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${res.body.token}`).expect(200);
    expect(me.body.email).toBe('a@b.co');
  });

  test('wrong password and unknown email give the same generic error', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@b.co', password: PASSWORD });
    const wrong = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'Wrong1234' }).expect(401);
    const unknown = await request(app).post('/api/auth/login').send({ email: 'nobody@b.co', password: PASSWORD }).expect(401);
    expect(wrong.body.error.message).toBe(unknown.body.error.message);
  });

  test('requests without a valid token are rejected', async () => {
    await request(app).get('/api/auth/me').expect(401);
    await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-token').expect(401);
  });
});
