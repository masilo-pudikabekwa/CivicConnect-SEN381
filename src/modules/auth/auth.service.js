const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ValidationError, Unauthorized, Conflict } = require('../../common/errors');

const BCRYPT_COST = 10;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// NFR-03: at least 8 characters, mixed case and a number.
function passwordProblems(password) {
  if (typeof password !== 'string' || password.length < 8) return 'must be at least 8 characters';
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) return 'must contain upper- and lower-case letters';
  if (!/\d/.test(password)) return 'must contain a number';
  return null;
}

function normaliseEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

// FR-07 registration/login. The user repository is injected (Repository pattern).
function createAuthService({ userRepo, jwtSecret, jwtExpiresIn = '8h' }) {
  return {
    // Self-registration always creates a CITIZEN; staff roles are assigned by an administrator (FR-09).
    async register({ email, password } = {}) {
      const fields = {};
      const cleanEmail = normaliseEmail(email);
      if (!EMAIL.test(cleanEmail) || cleanEmail.length > 254) fields.email = 'must be a valid email address';
      const pwProblem = passwordProblems(password);
      if (pwProblem) fields.password = pwProblem;
      if (Object.keys(fields).length) throw ValidationError(fields);

      const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
      try {
        const user = await userRepo.create({ email: cleanEmail, passwordHash, role: 'CITIZEN' });
        return { id: user.id, email: user.email, role: user.role };
      } catch (err) {
        if (err.code === 'P2002') throw Conflict('An account with this email already exists');
        throw err;
      }
    },

    // Same generic message for unknown email, wrong password or deactivated account (FR-07).
    async login({ email, password } = {}) {
      const user = await userRepo.findByEmail(normaliseEmail(email));
      const ok = user && user.isActive && typeof password === 'string' && (await bcrypt.compare(password, user.passwordHash));
      if (!ok) throw Unauthorized('Invalid email or password');
      const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });
      return { token, user: { id: user.id, email: user.email, role: user.role } };
    },

    // The token only carries the user id. Role and active flag are re-read on every request,
    // so an administrator's role/deactivation change applies on the user's next request (FR-09).
    async authenticate(token) {
      let payload;
      try {
        payload = jwt.verify(token, jwtSecret);
      } catch {
        throw Unauthorized('Invalid or expired session');
      }
      const user = await userRepo.findById(payload.sub);
      if (!user || !user.isActive) throw Unauthorized('Invalid or expired session');
      return { id: user.id, email: user.email, role: user.role };
    },

    hashPassword: (password) => bcrypt.hash(password, BCRYPT_COST),
  };
}

module.exports = { createAuthService, passwordProblems };
