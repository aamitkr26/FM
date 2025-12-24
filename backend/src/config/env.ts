import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const trimmed = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (typeof value === 'string' ? value.trim() : value), schema);

const envSchema = z.object({
  DATABASE_URL: trimmed(z.string().url()),
  JWT_SECRET: trimmed(z.string().min(32)),
  JWT_REFRESH_SECRET: trimmed(z.string().min(32)),
  JWT_EXPIRES_IN: trimmed(z.string()).default('15m'),
  JWT_REFRESH_EXPIRES_IN: trimmed(z.string()).default('7d'),
  PORT: trimmed(z.coerce.number().int().positive()).optional(),
  NODE_ENV: trimmed(z.enum(['development', 'production', 'test'])).default('development'),
  LOG_LEVEL: trimmed(z.enum(['error', 'warn', 'info', 'http', 'debug'])).optional(),
  FRONTEND_URL: trimmed(z.string().url()).default('http://localhost:5173'),
  // Comma-separated list of additional allowed origins for CORS/Socket.IO.
  // Example: https://fm-1-0.vercel.app,https://your-preview.vercel.app
  CORS_ORIGINS: trimmed(z.string()).default(''),
  GPS_PROVIDER: trimmed(z.enum(['millitrack', 'simulator'])).default('simulator'),
  GPS_POLL_INTERVAL: trimmed(z.string()).default('10000'),
  MILLITRACK_TOKEN: trimmed(z.string()).default(''),
  MILLITRACK_BASE_URL: trimmed(z.string()).default(
    'https://mvts1.millitrack.com/api/middleMan/getDeviceInfo',
  ),
  SIMULATION_FLEET_SIZE: trimmed(z.string()).default('10'),
  SIMULATION_ENABLE_THEFT: trimmed(z.string()).default('true'),
  SIMULATION_ENABLE_TAMPERING: trimmed(z.string()).default('true'),
});

const normalizeOrigin = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url;
  }
};

const parseCorsOrigins = (
  frontendUrl: string,
  corsOrigins: string,
  nodeEnv: string,
): string[] => {
  const origins = new Set<string>();

  // Always add the frontend URL
  origins.add(normalizeOrigin(frontendUrl));

  // Add additional origins from CORS_ORIGINS
  if (corsOrigins) {
    corsOrigins.split(',').forEach((origin) => {
      const trimmed = origin.trim();
      if (trimmed) {
        origins.add(normalizeOrigin(trimmed));
      }
    });
  }

  // In production, keep the allowlist tight by default.
  if (nodeEnv !== 'production') {
    origins.add('http://127.0.0.1:5173');
    origins.add('http://localhost:5173');
    origins.add('http://localhost:3000');
  }

  // Always allow production frontend in development for testing
  if (frontendUrl.includes('vercel.app')) {
    origins.add(normalizeOrigin(frontendUrl));
  }

  return Array.from(origins);
};

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  server: {
    port: parsed.data.PORT || 4000,
    env: parsed.data.NODE_ENV,
    isDevelopment: parsed.data.NODE_ENV === 'development',
    isProduction: parsed.data.NODE_ENV === 'production',
  },
  auth: {
    jwtSecret: parsed.data.JWT_SECRET,
    jwtRefreshSecret: parsed.data.JWT_REFRESH_SECRET,
    jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
    jwtRefreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },
  logger: {
    level: parsed.data.LOG_LEVEL,
  },
  frontend: {
    // Normalize to origin so CORS checks match browser Origin exactly.
    url: normalizeOrigin(parsed.data.FRONTEND_URL),
  },
  cors: {
    origins: parseCorsOrigins(
      parsed.data.FRONTEND_URL,
      parsed.data.CORS_ORIGINS,
      parsed.data.NODE_ENV,
    ),
  },
  gps: {
    provider: parsed.data.GPS_PROVIDER,
    pollInterval: parseInt(parsed.data.GPS_POLL_INTERVAL, 10),
  },
  millitrack: {
    token: parsed.data.MILLITRACK_TOKEN,
    baseUrl: parsed.data.MILLITRACK_BASE_URL,
  },
  simulation: {
    fleetSize: parseInt(parsed.data.SIMULATION_FLEET_SIZE, 10),
    enableTheft: parsed.data.SIMULATION_ENABLE_THEFT === 'true',
    enableTampering: parsed.data.SIMULATION_ENABLE_TAMPERING === 'true',
  },
};
