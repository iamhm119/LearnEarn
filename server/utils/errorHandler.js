const { HTTP_STATUS } = require('../config/constants');

class AppError extends Error {
  constructor(message, status = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.status = status;
  }
}

const handleError = (error, res) => {
  // Handle custom app errors
  if (error instanceof AppError) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      status: error.status
    });
  }

  // Handle MongoDB validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors)
      .map(err => err.message);
    return res.status(HTTP_STATUS.VALIDATION_ERROR).json({
      success: false,
      message: 'Validation error',
      errors: messages,
      status: HTTP_STATUS.VALIDATION_ERROR
    });
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: `${field} already exists`,
      status: HTTP_STATUS.CONFLICT
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
      status: HTTP_STATUS.UNAUTHORIZED
    });
  }

  // Handle generic server error
  console.error('Unhandled error:', error);
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR
  });
};

module.exports = {
  AppError,
  handleError
};
