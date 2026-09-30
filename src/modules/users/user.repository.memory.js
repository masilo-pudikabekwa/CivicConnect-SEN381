// In-memory implementation of the same contract as user.repository.prisma.js.
function createMemoryUserRepo() {
  const users = [];
  let nextId = 1;

  return {
    async create(data) {
      if (users.some((u) => u.email === data.email)) {
        // Mirror the Prisma unique-constraint error code so the service handles both the same way.
        throw Object.assign(new Error('Unique constraint failed on email'), { code: 'P2002' });
      }
      const user = { id: nextId++, role: 'CITIZEN', isActive: true, createdAt: new Date(), ...data };
      users.push(user);
      return { ...user };
    },

    async findByEmail(email) {
      const u = users.find((x) => x.email === email);
      return u ? { ...u } : null;
    },

    async findById(id) {
      const u = users.find((x) => x.id === id);
      return u ? { ...u } : null;
    },
  };
}

module.exports = { createMemoryUserRepo };
