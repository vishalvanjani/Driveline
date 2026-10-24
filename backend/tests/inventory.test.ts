import { beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { api, bearer, createUser, createVehicle } from './helpers.js';

let userToken: string;
let adminToken: string;

beforeEach(async () => {
  userToken = (await createUser('user@example.com')).token;
  adminToken = (await createUser('admin@example.com', 'ADMIN')).token;
});

describe('POST /api/vehicles/:id/purchase', () => {
  it('decrements the quantity by one and records the purchase', async () => {
    const vehicle = await createVehicle({ quantity: 2 });

    const res = await api().post(`/api/vehicles/${vehicle.id}/purchase`).set(bearer(userToken));

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(1);
    expect(await prisma.purchase.count({ where: { vehicleId: vehicle.id } })).toBe(1);
  });

  it('refuses to purchase an out-of-stock vehicle', async () => {
    const vehicle = await createVehicle({ quantity: 0 });

    const res = await api().post(`/api/vehicles/${vehicle.id}/purchase`).set(bearer(userToken));

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/out of stock/i);
  });

  it('never oversells when purchases race for the last unit', async () => {
    const vehicle = await createVehicle({ quantity: 1 });

    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        api().post(`/api/vehicles/${vehicle.id}/purchase`).set(bearer(userToken)),
      ),
    );

    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(4);
    const final = await prisma.vehicle.findUniqueOrThrow({ where: { id: vehicle.id } });
    expect(final.quantity).toBe(0);
  });

  it('returns 404 for an unknown vehicle', async () => {
    const res = await api().post('/api/vehicles/missing/purchase').set(bearer(userToken));
    expect(res.status).toBe(404);
  });
});

describe('POST /api/vehicles/:id/restock', () => {
  it('forbids non-admin users', async () => {
    const vehicle = await createVehicle();
    const res = await api().post(`/api/vehicles/${vehicle.id}/restock`).set(bearer(userToken)).send({ quantity: 1 });
    expect(res.status).toBe(403);
  });

  it('lets an admin increase the quantity', async () => {
    const vehicle = await createVehicle({ quantity: 0 });

    const res = await api().post(`/api/vehicles/${vehicle.id}/restock`).set(bearer(adminToken)).send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(5);
  });

  it('rejects a zero or negative restock amount', async () => {
    const vehicle = await createVehicle();
    const res = await api().post(`/api/vehicles/${vehicle.id}/restock`).set(bearer(adminToken)).send({ quantity: 0 });
    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown vehicle', async () => {
    const res = await api().post('/api/vehicles/missing/restock').set(bearer(adminToken)).send({ quantity: 1 });
    expect(res.status).toBe(404);
  });
});
