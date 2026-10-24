import { beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, createUser, createVehicle } from './helpers.js';

let userToken: string;
let adminToken: string;

beforeEach(async () => {
  userToken = (await createUser('user@example.com')).token;
  adminToken = (await createUser('admin@example.com', 'ADMIN')).token;
});

const payload = { make: 'Honda', model: 'Civic', category: 'Sedan', price: 24000, quantity: 2 };

describe('authentication guard', () => {
  it('rejects requests without a token', async () => {
    expect((await api().get('/api/vehicles')).status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const res = await api().get('/api/vehicles').set(bearer('not-a-jwt'));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/vehicles', () => {
  it('creates a vehicle', async () => {
    const res = await api().post('/api/vehicles').set(bearer(userToken)).send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
    expect(res.body.id).toEqual(expect.any(String));
  });

  it('rejects negative prices and non-integer quantities', async () => {
    const res = await api()
      .post('/api/vehicles')
      .set(bearer(userToken))
      .send({ ...payload, price: -1, quantity: 1.5 });

    expect(res.status).toBe(400);
    expect(res.body.details).toHaveProperty('price');
    expect(res.body.details).toHaveProperty('quantity');
  });
});

describe('GET /api/vehicles', () => {
  it('lists all vehicles', async () => {
    await createVehicle({ model: 'Corolla' });
    await createVehicle({ model: 'Camry' });

    const res = await api().get('/api/vehicles').set(bearer(userToken));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/vehicles/search', () => {
  beforeEach(async () => {
    await createVehicle({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000 });
    await createVehicle({ make: 'Toyota', model: 'RAV4', category: 'SUV', price: 35000 });
    await createVehicle({ make: 'Ford', model: 'F-150', category: 'Truck', price: 48000 });
  });

  const search = (query: Record<string, string>) =>
    api().get('/api/vehicles/search').query(query).set(bearer(userToken));

  it('filters by make, case-insensitively', async () => {
    const res = await search({ make: 'toyota' });
    expect(res.body.map((v: { model: string }) => v.model).sort()).toEqual(['Corolla', 'RAV4']);
  });

  it('filters by category', async () => {
    const res = await search({ category: 'Truck' });
    expect(res.body).toHaveLength(1);
    expect(res.body[0].model).toBe('F-150');
  });

  it('filters by price range', async () => {
    const res = await search({ minPrice: '30000', maxPrice: '40000' });
    expect(res.body).toHaveLength(1);
    expect(res.body[0].model).toBe('RAV4');
  });

  it('combines filters', async () => {
    const res = await search({ make: 'Toyota', maxPrice: '25000' });
    expect(res.body).toHaveLength(1);
    expect(res.body[0].model).toBe('Corolla');
  });

  it('ignores empty query values', async () => {
    const res = await search({ make: '', minPrice: '' });
    expect(res.body).toHaveLength(3);
  });

  it('rejects an inverted price range', async () => {
    const res = await search({ minPrice: '50000', maxPrice: '10000' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/vehicles/:id', () => {
  it('updates the given fields only', async () => {
    const vehicle = await createVehicle({ price: 22000, quantity: 3 });

    const res = await api().put(`/api/vehicles/${vehicle.id}`).set(bearer(userToken)).send({ price: 21000 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ price: 21000, quantity: 3 });
  });

  it('returns 404 for an unknown vehicle', async () => {
    const res = await api().put('/api/vehicles/missing').set(bearer(userToken)).send({ price: 1 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/vehicles/:id', () => {
  it('forbids non-admin users', async () => {
    const vehicle = await createVehicle();
    const res = await api().delete(`/api/vehicles/${vehicle.id}`).set(bearer(userToken));
    expect(res.status).toBe(403);
  });

  it('lets an admin delete a vehicle', async () => {
    const vehicle = await createVehicle();

    const res = await api().delete(`/api/vehicles/${vehicle.id}`).set(bearer(adminToken));

    expect(res.status).toBe(204);
    const list = await api().get('/api/vehicles').set(bearer(adminToken));
    expect(list.body).toHaveLength(0);
  });

  it('returns 404 for an unknown vehicle', async () => {
    const res = await api().delete('/api/vehicles/missing').set(bearer(adminToken));
    expect(res.status).toBe(404);
  });
});
