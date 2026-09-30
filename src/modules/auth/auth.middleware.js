const { Unauthorized, Forbidden } = require('../../common/errors');

// Resolves the Bearer token to req.user = { id, email, role }.
function requireAuth(authService) {
  return async (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) return next(Unauthorized());
    try {
      req.user = await authService.authenticate(token);
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

// FR-08: role-based access control, declared per route.
function requireRole(...roles) {
  return (req, res, next) => (roles.includes(req.user?.role) ? next() : next(Forbidden()));
}

module.exports = { requireAuth, requireRole };
