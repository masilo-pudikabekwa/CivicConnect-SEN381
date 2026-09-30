// Creates a PERSONNEL or ADMIN account in the database (the admin UI for FR-09 is not built yet).
// Usage: node scripts/create-staff.js <email> <password> [PERSONNEL|ADMIN]
require('dotenv').config();
const { createPrismaRepos } = require('../src/repositories');
const { passwordProblems, createAuthService } = require('../src/modules/auth/auth.service');

async function main() {
  const [email, password, role = 'PERSONNEL'] = process.argv.slice(2);
  if (!email || !password || !['PERSONNEL', 'ADMIN'].includes(role)) {
    throw new Error('Usage: node scripts/create-staff.js <email> <password> [PERSONNEL|ADMIN]');
  }
  const problem = passwordProblems(password);
  if (problem) throw new Error(`Password ${problem}`);

  const repos = createPrismaRepos();
  const { hashPassword } = createAuthService({ userRepo: repos.userRepo, jwtSecret: 'unused' });
  const user = await repos.userRepo.create({ email: email.toLowerCase(), passwordHash: await hashPassword(password), role });
  console.log(`Created ${user.role} account ${user.email} (id ${user.id})`);
  await repos.prisma.$disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
