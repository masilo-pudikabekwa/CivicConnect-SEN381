// Unit tests for the report lifecycle state machine (FR-05).
const { TRANSITIONS, STATUSES, canTransition, allowedNext, INITIAL_STATUS } = require('../src/modules/reports/report.status');

describe('report status state machine (FR-05)', () => {
  test('new reports start as SUBMITTED', () => {
    expect(INITIAL_STATUS).toBe('SUBMITTED');
  });

  test.each([
    ['SUBMITTED', 'UNDER_REVIEW'],
    ['UNDER_REVIEW', 'IN_PROGRESS'],
    ['UNDER_REVIEW', 'RESOLVED'],
    ['IN_PROGRESS', 'RESOLVED'],
  ])('allows %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  test.each([
    ['RESOLVED', 'SUBMITTED'], // explicit FR-05 acceptance example
    ['SUBMITTED', 'RESOLVED'], // cannot skip review
    ['IN_PROGRESS', 'UNDER_REVIEW'],
    ['SUBMITTED', 'SUBMITTED'],
  ])('rejects %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  test('RESOLVED is terminal', () => {
    expect(allowedNext('RESOLVED')).toEqual([]);
  });

  test('every transition targets a known status', () => {
    for (const targets of Object.values(TRANSITIONS)) {
      for (const t of targets) expect(STATUSES).toContain(t);
    }
    expect(Object.keys(TRANSITIONS).sort()).toEqual([...STATUSES].sort());
  });

  test('unknown status has no transitions', () => {
    expect(allowedNext('NOT_A_STATUS')).toEqual([]);
  });
});
