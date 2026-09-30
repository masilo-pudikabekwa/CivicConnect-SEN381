const crypto = require('crypto');
const { ValidationError, NotFound, InvalidTransition, Conflict } = require('../../common/errors');
const { validateNewReport, CATEGORIES } = require('./report.validation');
const status = require('./report.status');

const STAFF_ROLES = ['PERSONNEL', 'ADMIN'];

// e.g. CC-2026-7K3QX9: human-friendly and not guessable from the database id.
function newReference() {
  const suffix = crypto.randomBytes(4).readUInt32BE(0).toString(36).toUpperCase().padStart(6, '0').slice(-6);
  return `CC-${new Date().getFullYear()}-${suffix}`;
}

function toPublicView(report) {
  return {
    reference: report.reference,
    category: report.category,
    description: report.description,
    location: report.location,
    status: report.status,
    submittedAt: report.createdAt,
    lastUpdated: report.updatedAt,
    allowedNext: status.allowedNext(report.status),
  };
}

// Business rules for reports. Persistence is injected (Repository pattern) so this
// module never depends on Prisma directly and can be tested with in-memory repos.
function createReportService({ reportRepo }) {
  return {
    async submit(user, input) {
      const { value, errors } = validateNewReport(input);
      if (errors) throw ValidationError(errors);
      const report = await reportRepo.create({
        ...value,
        reference: newReference(),
        status: status.INITIAL_STATUS,
        reporterId: user.id,
      });
      return toPublicView(report);
    },

    // Citizens may only see their own reports; staff may see any. Others get 404
    // (not 403) so the existence of other people's reference numbers is not confirmed.
    async getByReference(user, reference) {
      const report = await reportRepo.findByReference(reference);
      const canSee = report && (report.reporterId === user.id || STAFF_ROLES.includes(user.role));
      if (!canSee) throw NotFound('Report');
      return toPublicView(report);
    },

    async list({ status: s, category, sort } = {}) {
      const filters = {};
      if (s) {
        if (!status.isValidStatus(s)) throw ValidationError({ status: 'unknown status' });
        filters.status = s;
      }
      if (category) {
        if (!CATEGORIES.includes(category)) throw ValidationError({ category: 'unknown category' });
        filters.category = category;
      }
      const order = sort === 'oldest' ? 'asc' : 'desc';
      const reports = await reportRepo.findMany(filters, order);
      return reports.map(toPublicView);
    },

    async changeStatus(user, reference, toStatus) {
      if (!status.isValidStatus(toStatus)) throw ValidationError({ status: 'unknown status' });
      const report = await reportRepo.findByReference(reference);
      if (!report) throw NotFound('Report');
      if (!status.canTransition(report.status, toStatus)) throw InvalidTransition(report.status, toStatus);

      // The repository applies the change only if the status is still report.status
      // (optimistic concurrency) and writes the audit row in the same transaction.
      const updated = await reportRepo.updateStatus({
        reportId: report.id,
        fromStatus: report.status,
        toStatus,
        changedById: user.id,
      });
      if (!updated) throw Conflict('Report status was changed by someone else; reload and try again');
      return toPublicView(updated);
    },
  };
}

module.exports = { createReportService, STAFF_ROLES };
