import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const initialEnv = { ...process.env };

const applyParsedEnv = (parsed: Record<string, string>, allowOverride: boolean) => {
  for (const [key, value] of Object.entries(parsed)) {
    if (initialEnv[key] !== undefined) continue;
    if (!allowOverride && process.env[key] !== undefined) continue;
    process.env[key] = value;
  }
};

const loadEnvFile = (filePath: string, allowOverride: boolean) => {
  try {
    if (!fs.existsSync(filePath)) return;
    const contents = fs.readFileSync(filePath);
    const parsed = dotenv.parse(contents);
    applyParsedEnv(parsed, allowOverride);
  } catch {
    return;
  }
};

const repoRootEnvPath = path.resolve(__dirname, '..', '..', '..', '.env');
const repoRootEnvDevPath = path.resolve(__dirname, '..', '..', '..', '.env.development');
const repoRootEnvLocalPath = path.resolve(__dirname, '..', '..', '..', '.env.local');
const repoRootEnvDevLocalPath = path.resolve(__dirname, '..', '..', '..', '.env.development.local');
const repoRootEnvProdPath = path.resolve(__dirname, '..', '..', '..', '.env.production');
const repoRootEnvProdLocalPath = path.resolve(__dirname, '..', '..', '..', '.env.production.local');
const backendEnvPath = path.resolve(__dirname, '..', '..', '.env');
const backendEnvDevPath = path.resolve(__dirname, '..', '..', '.env.development');
const backendEnvLocalPath = path.resolve(__dirname, '..', '..', '.env.local');
const backendEnvDevLocalPath = path.resolve(__dirname, '..', '..', '.env.development.local');
const backendEnvProdPath = path.resolve(__dirname, '..', '..', '.env.production');
const backendEnvProdLocalPath = path.resolve(__dirname, '..', '..', '.env.production.local');

const isDevScript = process.env.npm_lifecycle_event === 'dev';

const nodeEnv = process.env.NODE_ENV ?? 'development';

loadEnvFile(repoRootEnvPath, false);
loadEnvFile(backendEnvPath, true);

if (isDevScript) {
  loadEnvFile(repoRootEnvDevPath, true);
  loadEnvFile(backendEnvDevPath, true);

  loadEnvFile(repoRootEnvLocalPath, true);
  loadEnvFile(backendEnvLocalPath, true);

  loadEnvFile(repoRootEnvDevLocalPath, true);
  loadEnvFile(backendEnvDevLocalPath, true);
}

if (!isDevScript && nodeEnv === 'production') {
  loadEnvFile(repoRootEnvProdPath, true);
  loadEnvFile(backendEnvProdPath, true);

  loadEnvFile(repoRootEnvLocalPath, true);
  loadEnvFile(backendEnvLocalPath, true);

  loadEnvFile(repoRootEnvProdLocalPath, true);
  loadEnvFile(backendEnvProdLocalPath, true);
}

if (!process.env.MILLITRACK_BASE_URL && process.env.MILITRACK_BASE_URL) {
  process.env.MILLITRACK_BASE_URL = process.env.MILITRACK_BASE_URL;
}

if (!process.env.MILLITRACK_TOKEN) {
  if (process.env.MILITRACK_TOKEN) {
    process.env.MILLITRACK_TOKEN = process.env.MILITRACK_TOKEN;
  } else if (process.env.MILITRACK_ACCESS_TOKEN) {
    process.env.MILLITRACK_TOKEN = process.env.MILITRACK_ACCESS_TOKEN;
  }
}

const envSchemaBase = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().min(1),
  PORT: z.coerce.number().int().positive().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().min(1).default('https://fm-puce-iota.vercel.app'),
  CORS_ORIGINS: z.string().optional().default(''),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).optional(),
  MILLITRACK_BASE_URL: z.string().optional().default('https://mvts4.millitrack.com'),
  MILLITRACK_TOKEN: z.string().optional(),
});

const databaseUrlNeedsDirect = (raw: string): boolean => {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();

    if (host.endsWith('.pooler.supabase.com')) return true;
    if (url.searchParams.get('pgbouncer') === 'true') return true;
    if (url.port === '6543') return true;

    return false;
  } catch {
    return false;
  }
};

const envSchema = envSchemaBase.superRefine((data, ctx) => {
  if (
    !isDevScript &&
    data.NODE_ENV === 'production' &&
    databaseUrlNeedsDirect(data.DATABASE_URL) &&
    !data.DIRECT_URL
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DIRECT_URL'],
      message:
        'DIRECT_URL is required in production when using Supabase pooler/pgbouncer (needed for prisma migrate deploy). Set DIRECT_URL to the Supabase direct connection (port 5432, sslmode=require).',
    });
  }
});

const parse = envSchema.safeParse(process.env);
if (!parse.success) {
  throw new Error(`Invalid environment variables: ${JSON.stringify(parse.error.flatten().fieldErrors)}`);
}

const normalizeOrigin = (value: string): string => {
  try {
    const u = new URL(value);
    return `${u.protocol}//${u.host}`;
  } catch {
    return value;
  }
};

const buildCorsOrigins = (frontendUrl: string, corsOrigins: string, nodeEnv: string): string[] => {
  const origins = new Set<string>();
  origins.add(normalizeOrigin(frontendUrl));

  if (corsOrigins) {
    corsOrigins
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((o) => origins.add(normalizeOrigin(o)));
  }

  if (nodeEnv !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
  }

  return Array.from(origins);
};

export const env = {
  server: {
    port: parse.data.PORT ?? 4000,
    nodeEnv: isDevScript ? 'development' : parse.data.NODE_ENV,
  },
  auth: {
    jwtSecret: parse.data.JWT_SECRET,
  },
  militrack: {
    baseUrl: parse.data.MILLITRACK_BASE_URL,
    token: parse.data.MILLITRACK_TOKEN,
  },
  frontend: {
    url: normalizeOrigin(parse.data.FRONTEND_URL),
  },
  cors: {
    origins: buildCorsOrigins(
      parse.data.FRONTEND_URL,
      parse.data.CORS_ORIGINS ?? '',
      isDevScript ? 'development' : parse.data.NODE_ENV,
    ),
  },
  logger: {
    level: parse.data.LOG_LEVEL,
  },
};
