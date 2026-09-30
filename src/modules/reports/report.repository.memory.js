// In-memory implementation of the same repository contract as
// report.repository.prisma.js. Used by automated tests and USE_MEMORY_REPO demos.
function createMemoryReportRepo() {
  const reports = [];
  const changes = [];
  let nextId = 1;

  return {
    async create(data) {
      const now = new Date();
      const report = { id: nextId++, ...data, createdAt: now, updatedAt: now };
      reports.push(report);
      return { ...report };
    },

    async findByReference(reference) {
      const r = reports.find((x) => x.reference === reference);
      return r ? { ...r } : null;
    },

    async findMany(filters, order = 'desc') {
      const dir = order === 'asc' ? 1 : -1;
      return reports
        .filter((r) => Object.entries(filters).every(([k, v]) => r[k] === v))
        .sort((a, b) => dir * (a.createdAt - b.createdAt || a.id - b.id))
        .map((r) => ({ ...r }));
    },

    async updateStatus({ reportId, fromStatus, toStatus, changedById }) {
      const r = reports.find((x) => x.id === reportId);
      if (!r || r.status !== fromStatus) return null;
      r.status = toStatus;
      r.updatedAt = new Date();
      changes.push({ reportId, fromStatus, toStatus, changedById, changedAt: r.updatedAt });
      return { ...r };
    },

    // Test helper: inspect the audit trail.
    history(reportId) {
      return changes.filter((c) => c.reportId === reportId);
    },
  };
}

module.exports = { createMemoryReportRepo };
