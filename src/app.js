const path = require('path');
const express = require('express');
const helmet = require('helmet');
const { errorHandler, NotFound } = require('./common/errors');
const { createAuthService } = require('./modules/auth/auth.service');
const { authRoutes } = require('./modules/auth/auth.routes');
const { createReportService } = require('./modules/reports/report.service');
const { reportRoutes } = require('./modules/reports/report.routes');

// Composition root: repositories are passed in, services are built on top of them,
// and routes only talk to services. Tests call buildApp() with in-memory repos.
function buildApp({ repos, jwtSecret, jwtExpiresIn }) {
  const authService = createAuthService({ userRepo: repos.userRepo, jwtSecret, jwtExpiresIn });
  const reportService = createReportService({ reportRepo: repos.reportRepo });

  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', authRoutes({ authService }));
  app.use('/api/reports', reportRoutes({ reportService, authService }));
  app.use('/api', (req, res, next) => next(NotFound('Endpoint')));

  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(errorHandler);

  app.locals.services = { authService, reportService };
  return app;
}

module.exports = { buildApp };
