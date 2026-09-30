class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

const ValidationError = (fields) =>
  new AppError(400, 'VALIDATION_FAILED', 'One or more fields are invalid', fields);
const Unauthorized = (message = 'Authentication required') => new AppError(401, 'UNAUTHORIZED', message);
const Forbidden = () => new AppError(403, 'FORBIDDEN', 'You do not have access to this function');
const NotFound = (what = 'Resource') => new AppError(404, 'NOT_FOUND', `${what} not found`);
const Conflict = (message) => new AppError(409, 'CONFLICT', message);
const InvalidTransition = (from, to) =>
  new AppError(422, 'INVALID_TRANSITION', `Cannot change status from ${from} to ${to}`);

// Uniform error body for every API failure: { error: { code, message, fields? } }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, fields: err.fields } });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'BAD_JSON', message: 'Request body is not valid JSON' } });
  }
  console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected server error' } });
}

module.exports = { AppError, ValidationError, Unauthorized, Forbidden, NotFound, Conflict, InvalidTransition, errorHandler };
