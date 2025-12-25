import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

type DemoUser = {
  email: string;
  role: string;
};

const demoUsers: DemoUser[] = [
  { email: 'admin@fleet.com', role: 'owner' },
  { email: 'supervisor@fleet.com', role: 'supervisor' },
];

async function main() {
  const demoPassword = process.env.DEMO_PASSWORD;
  if (!demoPassword) {
    throw new Error('DEMO_PASSWORD is required to seed demo users');
  }

  const prisma = new PrismaClient();

  try {
    const hashed = await bcrypt.hash(demoPassword, 10);

    for (const u of demoUsers) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          password: hashed,
          role: u.role,
        },
        create: {
          email: u.email,
          password: hashed,
          role: u.role,
        },
      });
    }

    console.log('Seeded demo users:', demoUsers.map((u) => u.email).join(', '));
  } finally {
    await prisma.$disconnect();
  }
}

void main();
