const { config, assertConfig } = require('./config');
const { buildApp } = require('./app');
const { createMemoryRepos, createPrismaRepos } = require('./repositories');

async function seedDemoStaff(repos, authService) {
  // Memory mode only: optional staff account so the personnel workflow can be demonstrated.
  const { DEMO_STAFF_EMAIL: email, DEMO_STAFF_PASSWORD: password } = process.env;
  if (!email || !password) return;
  await repos.userRepo.create({ email, passwordHash: await authService.hashPassword(password), role: 'PERSONNEL' });
  console.log(`Demo personnel account created: ${email}`);
}

async function main() {
  assertConfig();
  const repos = config.useMemoryRepo ? createMemoryRepos() : createPrismaRepos();
  const app = buildApp({ repos, jwtSecret: config.jwtSecret, jwtExpiresIn: config.jwtExpiresIn });

  if (config.useMemoryRepo) {
    console.warn('USE_MEMORY_REPO=true: data is kept in memory and lost on restart.');
    await seedDemoStaff(repos, app.locals.services.authService);
  }

  app.listen(config.port, () => console.log(`CivicConnect listening on http://localhost:${config.port}`));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
