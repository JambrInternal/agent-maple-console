// src/utils/verboseLogger.js

/**
 * Verbose and detailed logger for development and debugging.
 * Usage: import logger from '../utils/verboseLogger'
 * logger.debug('message', ...args)
 * logger.info('message', ...args)
 * logger.warn('message', ...args)
 * logger.error('message', ...args)
 */
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function getTimestamp() {
  return new Date().toISOString();
}

function formatArgs(level, args) {
  return [`[${level}] [${getTimestamp()}]`, ...args];
}

const logger = {
  debug: (...args) => {
    if (isDev) console.debug(...formatArgs('DEBUG', args));
  },
  info: (...args) => {
    if (isDev) console.info(...formatArgs('INFO', args));
  },
  warn: (...args) => {
    if (isDev) console.warn(...formatArgs('WARN', args));
  },
  error: (...args) => {
    if (isDev) console.error(...formatArgs('ERROR', args));
  },
};

export default logger;
