import { PrismaClient } from '@prisma/client';

const normalizeDatabaseUrl = (raw?: string): string | undefined => {
  if (!raw) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const isSupabase = host.endsWith('.supabase.co') || host.endsWith('.pooler.supabase.com');
    const isPooler = host.endsWith('.pooler.supabase.com');
    const isTransactionPooler = isPooler && url.port === '6543';

    if (isSupabase && !url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
    }

    if (isTransactionPooler && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }

    return url.toString();
  } catch {
    return raw;
  }
};

const normalized = normalizeDatabaseUrl(process.env.DATABASE_URL);
if (normalized && normalized !== process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalized;
}

export const prisma = new PrismaClient();
