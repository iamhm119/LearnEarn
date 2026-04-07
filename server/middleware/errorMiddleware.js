const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', err, {
    method: req.method,
    path: req.path,
    query: req.query
  });

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
