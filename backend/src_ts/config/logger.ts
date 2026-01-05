import winston from 'winston';
import { env } from './env';

const level = env.logger.level ?? (env.server.nodeEnv === 'production' ? 'info' : 'debug');

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});
