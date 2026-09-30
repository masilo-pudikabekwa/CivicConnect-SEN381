require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  useMemoryRepo: process.env.USE_MEMORY_REPO === 'true',
};

// Fail fast on missing secrets instead of silently signing tokens with a default.
function assertConfig() {
  if (!config.jwtSecret || config.jwtSecret === 'change-me') {
    throw new Error('JWT_SECRET must be set in .env (see .env.example)');
  }
  if (!config.useMemoryRepo && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set, or USE_MEMORY_REPO=true for a database-free run');
  }
}

module.exports = { config, assertConfig };
