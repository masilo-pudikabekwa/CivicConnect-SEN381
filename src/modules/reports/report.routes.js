const express = require('express');
const { requireAuth, requireRole } = require('../auth/auth.middleware');
const { STAFF_ROLES } = require('./report.service');
const { TRANSITIONS } = require('./report.status');
const { CATEGORIES } = require('./report.validation');

// Express 5 forwards rejected promises from async handlers to the error middleware.
function reportRoutes({ reportService, authService }) {
  const router = express.Router();
  const auth = requireAuth(authService);

  // Reference data for the UI (no personal information).
  router.get('/meta', (req, res) => res.json({ categories: CATEGORIES, transitions: TRANSITIONS }));

  // FR-01, FR-02, FR-03: a citizen submits a report and receives a reference number.
  router.post('/', auth, requireRole('CITIZEN'), async (req, res) => {
    res.status(201).json(await reportService.submit(req.user, req.body));
  });

  // FR-06: staff list with filter/sort.
  router.get('/', auth, requireRole(...STAFF_ROLES), async (req, res) => {
    res.json(await reportService.list(req.query));
  });

  // FR-04: status lookup by reference.
  router.get('/:reference', auth, async (req, res) => {
    res.json(await reportService.getByReference(req.user, req.params.reference));
  });

  // FR-05: staff moves a report to a valid next status.
  router.patch('/:reference/status', auth, requireRole(...STAFF_ROLES), async (req, res) => {
    res.json(await reportService.changeStatus(req.user, req.params.reference, req.body?.status));
  });

  return router;
}

module.exports = { reportRoutes };
