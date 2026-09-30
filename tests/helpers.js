const request = require('supertest');
const { buildApp } = require('../src/app');
const { createMemoryRepos } = require('../src/repositories');

const PASSWORD = 'Passw0rdOk';

// Fresh app + in-memory repositories per test file: no database required.
function makeApp() {
  const repos = createMemoryRepos();
  const app = buildApp({ repos, jwtSecret: 'test-secret' });
  return { app, repos, services: app.locals.services };
}

async function registerAndLogin(app, email) {
  await request(app).post('/api/auth/register').send({ email, password: PASSWORD }).expect(201);
  const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD }).expect(200);
  return res.body.token;
}

async function staffToken(app, repos, services, email = 'staff@civic.test', role = 'PERSONNEL') {
  await repos.userRepo.create({ email, passwordHash: await services.authService.hashPassword(PASSWORD), role });
  const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD }).expect(200);
  return res.body.token;
}

const validReport = {
  category: 'ROADS',
  description: 'Large pothole in the left lane outside number 12',
  location: '12 Church Street, Pretoria',
};

module.exports = { makeApp, registerAndLogin, staffToken, validReport, PASSWORD };
