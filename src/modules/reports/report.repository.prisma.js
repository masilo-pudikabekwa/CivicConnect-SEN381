// PostgreSQL implementation of the report repository (via Prisma).
// Must keep the same method contract as report.repository.memory.js.
function createPrismaReportRepo(prisma) {
  return {
    create(data) {
      return prisma.report.create({ data });
    },

    findByReference(reference) {
      return prisma.report.findUnique({ where: { reference } });
    },

    findMany(filters, order = 'desc') {
      return prisma.report.findMany({ where: filters, orderBy: [{ createdAt: order }, { id: order }], take: 200 });
    },

    // Status update + audit row are atomic. The WHERE on the old status means two
    // concurrent staff updates cannot both succeed: the second one updates 0 rows.
    updateStatus({ reportId, fromStatus, toStatus, changedById }) {
      return prisma.$transaction(async (tx) => {
        const { count } = await tx.report.updateMany({
          where: { id: reportId, status: fromStatus },
          data: { status: toStatus },
        });
        if (count === 0) return null;
        await tx.statusChange.create({ data: { reportId, fromStatus, toStatus, changedById } });
        return tx.report.findUnique({ where: { id: reportId } });
      });
    },
  };
}

module.exports = { createPrismaReportRepo };
