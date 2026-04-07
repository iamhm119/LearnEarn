const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

const validateString = (str, minLength = 1, maxLength = 500) => {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

const validateRequired = (fields) => {
  const errors = [];
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors.push(`${key} is required`);
    }
  }
  return errors;
};

const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateString,
  validateRequired,
  validateObjectId,
  sanitizeInput
};
