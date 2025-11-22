import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `${String(timestamp)} [${String(level)}]: ${String(message)}\n${String(stack)}`;
    }
    return `${String(timestamp)} [${String(level)}]: ${String(message)}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'weight-tracker-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ],
});

// Don't log during tests
if (process.env.NODE_ENV === 'test') {
  logger.silent = true;
}
