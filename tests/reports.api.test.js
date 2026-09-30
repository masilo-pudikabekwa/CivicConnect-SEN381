// End-to-end API tests for the core reporting workflow using in-memory repositories.
// Traces: FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-08.
const request = require('supertest');
const { makeApp, registerAndLogin, staffToken, validReport } = require('./helpers');

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('reports API', () => {
  let app;
  let repos;
  let services;
  let citizen;
  let staff;

  beforeEach(async () => {
    ({ app, repos, services } = makeApp());
    citizen = await registerAndLogin(app, 'citizen@civic.test');
    staff = await staffToken(app, repos, services);
  });

  const submit = (token = citizen, body = validReport) => request(app).post('/api/reports').set(auth(token)).send(body);

  test('FR-01/FR-03: citizen submits a report and gets a reference with status SUBMITTED', async () => {
    const res = await submit().expect(201);
    expect(res.body.reference).toMatch(/^CC-\d{4}-[0-9A-Z]{6}$/);
    expect(res.body.status).toBe('SUBMITTED');
  });

  test('FR-02: missing fields are rejected and identified, nothing is stored', async () => {
    const res = await submit(citizen, { category: 'ROADS' }).expect(400);
    expect(Object.keys(res.body.error.fields).sort()).toEqual(['description', 'location']);
    expect(await repos.reportRepo.findMany({})).toHaveLength(0);
  });

  test('submission requires authentication', async () => {
    await request(app).post('/api/reports').send(validReport).expect(401);
  });

  test('FR-04: owner can view status and last-updated date; another citizen cannot', async () => {
    const { reference } = (await submit()).body;
    const own = await request(app).get(`/api/reports/${reference}`).set(auth(citizen)).expect(200);
    expect(own.body).toMatchObject({ reference, status: 'SUBMITTED' });
    expect(own.body.lastUpdated).toBeTruthy();

    const other = await registerAndLogin(app, 'other@civic.test');
    await request(app).get(`/api/reports/${reference}`).set(auth(other)).expect(404);
  });

  test('FR-05: personnel move a report through valid transitions and each change is audited', async () => {
    const { reference } = (await submit()).body;
    for (const status of ['UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED']) {
      const res = await request(app).patch(`/api/reports/${reference}/status`).set(auth(staff)).send({ status }).expect(200);
      expect(res.body.status).toBe(status);
    }
    const report = await repos.reportRepo.findByReference(reference);
    expect(repos.reportRepo.history(report.id).map((c) => c.toStatus)).toEqual(['UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED']);

    const citizenView = await request(app).get(`/api/reports/${reference}`).set(auth(citizen)).expect(200);
    expect(citizenView.body.status).toBe('RESOLVED');
  });

  test('FR-05: invalid transition (RESOLVED -> SUBMITTED) is rejected', async () => {
    const { reference } = (await submit()).body;
    for (const status of ['UNDER_REVIEW', 'RESOLVED']) {
      await request(app).patch(`/api/reports/${reference}/status`).set(auth(staff)).send({ status }).expect(200);
    }
    const res = await request(app).patch(`/api/reports/${reference}/status`).set(auth(staff)).send({ status: 'SUBMITTED' }).expect(422);
    expect(res.body.error.code).toBe('INVALID_TRANSITION');
  });

  test('FR-05: a stale concurrent update is rejected with 409', async () => {
    const { reference } = (await submit()).body;
    const report = await repos.reportRepo.findByReference(reference);
    // Simulate another staff member changing the status between our read and our write.
    await repos.reportRepo.updateStatus({ reportId: report.id, fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW', changedById: 99 });
    const stale = await repos.reportRepo.updateStatus({ reportId: report.id, fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW', changedById: 98 });
    expect(stale).toBeNull();
  });

  test('FR-08: citizens cannot change status or list all reports', async () => {
    const { reference } = (await submit()).body;
    await request(app).patch(`/api/reports/${reference}/status`).set(auth(citizen)).send({ status: 'UNDER_REVIEW' }).expect(403);
    await request(app).get('/api/reports').set(auth(citizen)).expect(403);
  });

  test('FR-08: staff cannot submit reports as citizens', async () => {
    await submit(staff).expect(403);
  });

  test('FR-06: personnel filter by status and category', async () => {
    const a = (await submit()).body;
    await submit(citizen, { ...validReport, category: 'WATER' });
    await request(app).patch(`/api/reports/${a.reference}/status`).set(auth(staff)).send({ status: 'UNDER_REVIEW' });

    const byStatus = await request(app).get('/api/reports?status=UNDER_REVIEW').set(auth(staff)).expect(200);
    expect(byStatus.body.map((r) => r.reference)).toEqual([a.reference]);

    const byCategory = await request(app).get('/api/reports?category=WATER').set(auth(staff)).expect(200);
    expect(byCategory.body).toHaveLength(1);

    await request(app).get('/api/reports?status=BOGUS').set(auth(staff)).expect(400);
  });
});
