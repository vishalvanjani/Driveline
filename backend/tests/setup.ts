import { afterAll, beforeEach } from 'vitest';

process.env.DATABASE_URL ??= 'file:./test.db';
process.env.JWT_SECRET = 'test-secret';

const { prisma } = await import('../src/lib/prisma.js');

beforeEach(async () => {
  await prisma.purchase.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(() => prisma.$disconnect());
