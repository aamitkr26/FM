require('../dist/config/env');

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  for (const email of ['admin@fleet.com', 'supervisor@fleet.com']) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log('USER_NOT_FOUND', email);
      continue;
    }

    const hash = String(user.password || '');
    console.log(
      'USER_FOUND',
      JSON.stringify({ email: user.email, role: user.role, hashPrefix: hash.slice(0, 7), hashLen: hash.length }),
    );

    for (const candidate of ['password123', 'admin123', 'super123']) {
      try {
        const ok = await bcrypt.compare(candidate, hash);
        console.log(`COMPARE_${email}_${candidate}`, ok);
      } catch (e) {
        console.log(`COMPARE_${email}_${candidate}_ERROR`, e && e.message ? e.message : String(e));
      }
    }
  }
})()
  .catch((e) => {
    console.error('SCRIPT_ERROR', e && e.message ? e.message : String(e));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
