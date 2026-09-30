// Chooses the persistence implementation at start-up (Repository pattern).
const { createMemoryUserRepo } = require('./modules/users/user.repository.memory');
const { createMemoryReportRepo } = require('./modules/reports/report.repository.memory');

function createMemoryRepos() {
  return { userRepo: createMemoryUserRepo(), reportRepo: createMemoryReportRepo() };
}

function createPrismaRepos() {
  // Required lazily so memory mode and tests do not need a generated Prisma client or a database.
  const { PrismaClient } = require('@prisma/client');
  const { createPrismaUserRepo } = require('./modules/users/user.repository.prisma');
  const { createPrismaReportRepo } = require('./modules/reports/report.repository.prisma');
  const prisma = new PrismaClient();
  return { userRepo: createPrismaUserRepo(prisma), reportRepo: createPrismaReportRepo(prisma), prisma };
}

module.exports = { createMemoryRepos, createPrismaRepos };
