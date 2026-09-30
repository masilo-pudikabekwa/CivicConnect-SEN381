// Minimum structured data set for a report (FR-02) and input validation before
// anything is persisted (NFR-05). The same length limits are enforced by the DB schema.

const CATEGORIES = Object.freeze(['ROADS', 'WATER', 'ELECTRICITY', 'WASTE', 'SAFETY', 'OTHER']);
const LIMITS = Object.freeze({ description: { min: 10, max: 1000 }, location: { min: 3, max: 255 } });

// Letters, digits, whitespace and common punctuation; rejects control characters and < > markup.
const PERMITTED_TEXT = /^[\p{L}\p{N}\s.,;:'"!?()\-/#&@]+$/u;

function checkText(fields, name, value) {
  const { min, max } = LIMITS[name];
  if (typeof value !== 'string' || value.trim() === '') {
    fields[name] = 'is required';
  } else if (value.trim().length < min) {
    fields[name] = `must be at least ${min} characters`;
  } else if (value.length > max) {
    fields[name] = `must be at most ${max} characters`;
  } else if (!PERMITTED_TEXT.test(value)) {
    fields[name] = 'contains characters that are not permitted';
  }
}

/** Returns { value, errors } where errors is null when the input is valid. */
function validateNewReport(input = {}) {
  const fields = {};
  if (!input.category) fields.category = 'is required';
  else if (!CATEGORIES.includes(input.category)) fields.category = `must be one of ${CATEGORIES.join(', ')}`;
  checkText(fields, 'description', input.description);
  checkText(fields, 'location', input.location);

  if (Object.keys(fields).length) return { value: null, errors: fields };
  return {
    value: { category: input.category, description: input.description.trim(), location: input.location.trim() },
    errors: null,
  };
}

module.exports = { CATEGORIES, LIMITS, validateNewReport };
