import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false,
});

export const telemetryLimiter = rateLimit({
  windowMs: 60_000,
  limit: 3_000,
  standardHeaders: true,
  legacyHeaders: false,
});
