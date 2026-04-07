const { sanitizeInput } = require('../utils/validator');

const validateInput = (req, res, next) => {
  // Sanitize all inputs
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeInput(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeInput(req.params);
  }

  next();
};

module.exports = validateInput;
