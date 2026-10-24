import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

/**
 * Seeds one admin account and a small starter inventory.
 * Admin role is intentionally NOT assignable via /register — only via seed or DB.
 */
async function main() {
  const passwordHash = await bcrypt.hash('Admin1234!', 10);
  await db.user.upsert({
    where: { email: 'admin@dealership.test' },
    update: { role: 'ADMIN' },
    create: { email: 'admin@dealership.test', passwordHash, role: 'ADMIN' },
  });

  if ((await db.vehicle.count()) === 0) {
    await db.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 4 },
        { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 34500, quantity: 2 },
        { make: 'Ford', model: 'F-150', category: 'Truck', price: 48000, quantity: 1 },
        { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 41000, quantity: 0 },
        { make: 'Mazda', model: 'MX-5', category: 'Convertible', price: 29000, quantity: 3 },
      ],
    });
  }
  console.log('Seeded admin@dealership.test / Admin1234! and starter vehicles');
}

main().finally(() => db.$disconnect());
