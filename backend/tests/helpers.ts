import bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Prisma } from '@prisma/client';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';
import type { Role } from '../src/modules/auth/auth.service.js';

export const app = createApp(prisma);
export const api = () => request(app);

export const PASSWORD = 'Password123';

/** Creates a user directly in the DB (the only way to get an ADMIN) and logs them in. */
export async function createUser(email: string, role: Role = 'USER') {
  const passwordHash = await bcrypt.hash(PASSWORD, 4);
  const user = await prisma.user.create({ data: { email, passwordHash, role } });
  const res = await api().post('/api/auth/login').send({ email, password: PASSWORD });
  return { user, token: res.body.token as string };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export function createVehicle(overrides: Partial<Prisma.VehicleCreateInput> = {}) {
  return prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 3, ...overrides },
  });
}
