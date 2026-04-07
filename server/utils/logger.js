const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const logToFile = (level, message, data = {}) => {
  const logFile = path.join(logsDir, `${level}.log`);
  const logEntry = JSON.stringify({
    timestamp: getTimestamp(),
    level,
    message,
    ...data
  });

  fs.appendFileSync(logFile, logEntry + '\n');
};

const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${getTimestamp()}:`, message);
    if (process.env.NODE_ENV === 'production') {
      logToFile('info', message, data);
    }
  },

  error: (message, error = {}, data = {}) => {
    console.error(`[ERROR] ${getTimestamp()}:`, message, error);
    logToFile('error', message, {
      error: error.message || error,
      stack: error.stack,
      ...data
    });
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${getTimestamp()}:`, message);
    logToFile('warn', message, data);
  },

  debug: (message, data = {}) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] ${getTimestamp()}:`, message, data);
    }
  }
};

module.exports = logger;
