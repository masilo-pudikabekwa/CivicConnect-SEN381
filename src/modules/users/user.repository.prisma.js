// PostgreSQL implementation of the user repository (via Prisma).
// Must keep the same method contract as user.repository.memory.js.
function createPrismaUserRepo(prisma) {
  return {
    create(data) {
      return prisma.user.create({ data });
    },

    findByEmail(email) {
      return prisma.user.findUnique({ where: { email } });
    },

    findById(id) {
      return prisma.user.findUnique({ where: { id } });
    },
  };
}

module.exports = { createPrismaUserRepo };
