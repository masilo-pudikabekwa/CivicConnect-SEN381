// Report lifecycle state machine (FR-05, FE-03).
// Design decision: table-driven State pattern. The TRANSITIONS table is the single
// source of truth for which status changes are legal; the service, API and UI all
// read from it instead of re-implementing the rules with scattered if-statements.

const STATUSES = Object.freeze(['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED']);

const TRANSITIONS = Object.freeze({
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [], // terminal: a resolved report cannot move back (FR-05 acceptance criterion)
});

const INITIAL_STATUS = 'SUBMITTED';

function isValidStatus(status) {
  return STATUSES.includes(status);
}

function allowedNext(status) {
  return TRANSITIONS[status] || [];
}

function canTransition(from, to) {
  return allowedNext(from).includes(to);
}

module.exports = { STATUSES, TRANSITIONS, INITIAL_STATUS, isValidStatus, allowedNext, canTransition };
