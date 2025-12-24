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

function normalizeOrigin(value: string): string {
  return new URL(value).origin;
}

function parseCorsOrigins(
  frontendUrl: string,
  extraOriginsCsv: string,
  nodeEnv: 'development' | 'production' | 'test',
): string[] {
  const origins = new Set<string>();
  origins.add(normalizeOrigin(frontendUrl));

  for (const raw of extraOriginsCsv.split(',')) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    try {
      origins.add(normalizeOrigin(trimmed));
    } catch {
      // ignore invalid origin entries
    }
  }

  // In production, keep the allowlist tight by default.
  if (nodeEnv !== 'production') {
    origins.add('http://127.0.0.1:5173');
    origins.add('http://localhost:5173');
    origins.add('http://localhost:3000');
  }

  // Always allow production frontend in development for testing
  origins.add('https://fm-puce-iota.vercel.app');

  return Array.from(origins);
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  database: {
    url: parsed.data.DATABASE_URL,
  },
  jwt: {
    secret: parsed.data.JWT_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
    refreshExpiresIn: parsed.data.JWT_REFRESH_EXPIRES_IN,
  },
  server: {
    // Render/Docker often expects port 10000 in production if PORT isn't explicitly set.
    port: parsed.data.PORT ?? (parsed.data.NODE_ENV === 'production' ? 10000 : 4000),
    env: parsed.data.NODE_ENV,
    isDevelopment: parsed.data.NODE_ENV === 'development',
    isProduction: parsed.data.NODE_ENV === 'production',
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
