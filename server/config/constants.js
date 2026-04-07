module.exports = {
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED_ACCESS: 'Unauthorized access',
    INVALID_TOKEN: 'Invalid or expired token',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error',
    COURSE_NOT_FOUND: 'Course not found',
    MODULE_NOT_FOUND: 'Module not found',
    QUIZ_NOT_FOUND: 'Quiz not found'
  },

  JWT_EXPIRY: '7d',
  PASSWORD_SALT_ROUNDS: 10,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100
};
