const express = require('express');
const { requireAuth } = require('./auth.middleware');

function authRoutes({ authService }) {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    res.status(201).json(await authService.register(req.body));
  });

  router.post('/login', async (req, res) => {
    res.json(await authService.login(req.body));
  });

  router.get('/me', requireAuth(authService), (req, res) => {
    res.json(req.user);
  });

  return router;
}

module.exports = { authRoutes };
