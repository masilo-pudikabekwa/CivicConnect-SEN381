// Unit tests for the minimum report data set (FR-02) and input validation (NFR-05).
const { validateNewReport, LIMITS } = require('../src/modules/reports/report.validation');
const { validReport } = require('./helpers');

describe('validateNewReport (FR-02, NFR-05)', () => {
  test('accepts a complete report and trims text', () => {
    const { value, errors } = validateNewReport({ ...validReport, location: '  12 Church Street  ' });
    expect(errors).toBeNull();
    expect(value.location).toBe('12 Church Street');
  });

  test('identifies every missing required field', () => {
    const { errors } = validateNewReport({});
    expect(Object.keys(errors).sort()).toEqual(['category', 'description', 'location']);
  });

  test('rejects an unknown category', () => {
    expect(validateNewReport({ ...validReport, category: 'ALIENS' }).errors).toHaveProperty('category');
  });

  test('rejects over-length description', () => {
    const description = 'a'.repeat(LIMITS.description.max + 1);
    expect(validateNewReport({ ...validReport, description }).errors.description).toMatch(/at most/);
  });

  test('rejects disallowed characters', () => {
    const { errors } = validateNewReport({ ...validReport, description: '<script>alert(1)</script> here' });
    expect(errors.description).toMatch(/not permitted/);
  });

  test('rejects whitespace-only text as missing', () => {
    expect(validateNewReport({ ...validReport, location: '    ' }).errors.location).toBe('is required');
  });
});
