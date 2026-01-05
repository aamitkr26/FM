"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.env = void 0;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _zod = require("zod");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const initialEnv = {
  ...process.env
};
const applyParsedEnv = (parsed, allowOverride) => {
  for (const [key, value] of Object.entries(parsed)) {
    if (initialEnv[key] !== undefined) continue;
    if (!allowOverride && process.env[key] !== undefined) continue;
    process.env[key] = value;
  }
};
const loadEnvFile = (filePath, allowOverride) => {
  try {
    if (!_fs.default.existsSync(filePath)) return;
    const contents = _fs.default.readFileSync(filePath);
    const parsed = _dotenv.default.parse(contents);
    applyParsedEnv(parsed, allowOverride);
  } catch {
    return;
  }
};
const repoRootEnvPath = _path.default.resolve(__dirname, '..', '..', '..', '.env');
const repoRootEnvDevPath = _path.default.resolve(__dirname, '..', '..', '..', '.env.development');
const repoRootEnvLocalPath = _path.default.resolve(__dirname, '..', '..', '..', '.env.local');
const repoRootEnvDevLocalPath = _path.default.resolve(__dirname, '..', '..', '..', '.env.development.local');
const repoRootEnvProdPath = _path.default.resolve(__dirname, '..', '..', '..', '.env.production');
const repoRootEnvProdLocalPath = _path.default.resolve(__dirname, '..', '..', '..', '.env.production.local');
const backendEnvPath = _path.default.resolve(__dirname, '..', '..', '.env');
const backendEnvDevPath = _path.default.resolve(__dirname, '..', '..', '.env.development');
const backendEnvLocalPath = _path.default.resolve(__dirname, '..', '..', '.env.local');
const backendEnvDevLocalPath = _path.default.resolve(__dirname, '..', '..', '.env.development.local');
const backendEnvProdPath = _path.default.resolve(__dirname, '..', '..', '.env.production');
const backendEnvProdLocalPath = _path.default.resolve(__dirname, '..', '..', '.env.production.local');
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
const envSchemaBase = _zod.z.object({
  DATABASE_URL: _zod.z.string().min(1),
  DIRECT_URL: _zod.z.string().optional(),
  JWT_SECRET: _zod.z.string().min(1),
  PORT: _zod.z.coerce.number().int().positive().optional(),
  NODE_ENV: _zod.z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: _zod.z.string().min(1).default('https://fm-puce-iota.vercel.app'),
  CORS_ORIGINS: _zod.z.string().optional().default(''),
  LOG_LEVEL: _zod.z.enum(['error', 'warn', 'info', 'http', 'debug']).optional(),
  MILLITRACK_BASE_URL: _zod.z.string().optional().default('https://mvts4.millitrack.com'),
  MILLITRACK_TOKEN: _zod.z.string().optional()
});
const databaseUrlNeedsDirect = raw => {
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
  if (!isDevScript && data.NODE_ENV === 'production' && databaseUrlNeedsDirect(data.DATABASE_URL) && !data.DIRECT_URL) {
    ctx.addIssue({
      code: _zod.z.ZodIssueCode.custom,
      path: ['DIRECT_URL'],
      message: 'DIRECT_URL is required in production when using Supabase pooler/pgbouncer (needed for prisma migrate deploy). Set DIRECT_URL to the Supabase direct connection (port 5432, sslmode=require).'
    });
  }
});
const parse = envSchema.safeParse(process.env);
if (!parse.success) {
  throw new Error(`Invalid environment variables: ${JSON.stringify(parse.error.flatten().fieldErrors)}`);
}
const normalizeOrigin = value => {
  try {
    const u = new URL(value);
    return `${u.protocol}//${u.host}`;
  } catch {
    return value;
  }
};
const buildCorsOrigins = (frontendUrl, corsOrigins, nodeEnv) => {
  const origins = new Set();
  origins.add(normalizeOrigin(frontendUrl));
  if (corsOrigins) {
    corsOrigins.split(',').map(s => s.trim()).filter(Boolean).forEach(o => origins.add(normalizeOrigin(o)));
  }
  if (nodeEnv !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
    origins.add('http://localhost:5173');
    origins.add('http://127.0.0.1:5173');
  }
  return Array.from(origins);
};
const env = exports.env = {
  server: {
    port: parse.data.PORT ?? 4000,
    nodeEnv: isDevScript ? 'development' : parse.data.NODE_ENV
  },
  auth: {
    jwtSecret: parse.data.JWT_SECRET
  },
  militrack: {
    baseUrl: parse.data.MILLITRACK_BASE_URL,
    token: parse.data.MILLITRACK_TOKEN
  },
  frontend: {
    url: normalizeOrigin(parse.data.FRONTEND_URL)
  },
  cors: {
    origins: buildCorsOrigins(parse.data.FRONTEND_URL, parse.data.CORS_ORIGINS ?? '', isDevScript ? 'development' : parse.data.NODE_ENV)
  },
  logger: {
    level: parse.data.LOG_LEVEL
  }
};