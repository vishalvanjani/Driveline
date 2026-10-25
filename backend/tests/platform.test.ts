import { beforeEach, describe, expect, it } from 'vitest';
import { api, bearer, createUser, createVehicle } from './helpers.js';

let userToken: string;
let adminToken: string;

beforeEach(async () => {
  userToken = (await createUser('user@example.com')).token;
  adminToken = (await createUser('admin@example.com', 'ADMIN')).token;
});

describe('GET /api/analytics/kpis', () => {
  it('calculates correct KPIs from actual database records', async () => {
    // 2 Corolla ($20k each) = $40k
    const v1 = await createVehicle({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 2 });
    // 1 F-150 ($50k) = $50k
    await createVehicle({ make: 'Ford', model: 'F-150', category: 'Truck', price: 50000, quantity: 1 });

    // Purchase 1 unit of Corolla
    await api().post(`/api/vehicles/${v1.id}/purchase`).set(bearer(userToken));

    const res = await api().get('/api/analytics/kpis').set(bearer(userToken));

    expect(res.status).toBe(200);
    expect(res.body.totalVehicles).toBe(2);
    // After purchase: Corolla has 1 left, F-150 has 1 left = 2 available
    expect(res.body.availableVehicles).toBe(2);
    expect(res.body.unitsSold).toBe(1);
    expect(res.body.totalRevenue).toBe(20000);
    // Inventory value: 1 * 20000 + 1 * 50000 = 70000
    expect(res.body.totalInventoryValue).toBe(70000);
    // Both vehicles have quantity 1 (which is <= lowStockThreshold 2)
    expect(res.body.lowStockCount).toBe(2);
    expect(res.body.outOfStockCount).toBe(0);
    expect(res.body.categoryDistribution).toHaveLength(2);
  });
});

describe('GET /api/sales', () => {
  it('returns sales ledger with historical price and buyer details', async () => {
    const v = await createVehicle({ make: 'Tesla', model: 'Model 3', price: 42000, quantity: 3 });
    await api().post(`/api/vehicles/${v.id}/purchase`).set(bearer(userToken));

    const res = await api().get('/api/sales').set(bearer(userToken));

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      vehicleMake: 'Tesla',
      vehicleModel: 'Model 3',
      pricePaid: 42000,
      buyerEmail: 'user@example.com',
    });
  });
});

describe('GET /api/activity', () => {
  it('chronologically records persistent activity for vehicle lifecycle events', async () => {
    const v = await createVehicle({ make: 'Mazda', model: 'MX-5', price: 30000, quantity: 1 });
    await api().post(`/api/vehicles/${v.id}/restock`).set(bearer(adminToken)).send({ quantity: 4 });
    await api().post(`/api/vehicles/${v.id}/purchase`).set(bearer(userToken));

    const res = await api().get('/api/activity').set(bearer(userToken));

    expect(res.status).toBe(200);
    const actions = res.body.map((a: { action: string }) => a.action);
    expect(actions).toContain('RESTOCKED');
    expect(actions).toContain('PURCHASED');
  });
});

describe('GET /api/customers', () => {
  it('forbids non-admin users from accessing customer list', async () => {
    const res = await api().get('/api/customers').set(bearer(userToken));
    expect(res.status).toBe(403);
  });

  it('allows admin to view customer summaries with total spend', async () => {
    const v = await createVehicle({ price: 15000, quantity: 2 });
    await api().post(`/api/vehicles/${v.id}/purchase`).set(bearer(userToken));

    const res = await api().get('/api/customers').set(bearer(adminToken));

    expect(res.status).toBe(200);
    const userCustomer = res.body.find((c: { email: string }) => c.email === 'user@example.com');
    expect(userCustomer).toBeDefined();
    expect(userCustomer.purchaseCount).toBe(1);
    expect(userCustomer.totalSpent).toBe(15000);
  });
});

describe('Sorting and Status in GET /api/vehicles/search', () => {
  beforeEach(async () => {
    await createVehicle({ make: 'BMW', model: 'M3', price: 75000, quantity: 5 });
    await createVehicle({ make: 'Audi', model: 'A4', price: 40000, quantity: 1 });
    await createVehicle({ make: 'Chevy', model: 'Bolt', price: 25000, quantity: 0 });
  });

  it('filters by status: low_stock', async () => {
    const res = await api().get('/api/vehicles/search').query({ status: 'low_stock' }).set(bearer(userToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].model).toBe('A4');
  });

  it('filters by status: out_of_stock', async () => {
    const res = await api().get('/api/vehicles/search').query({ status: 'out_of_stock' }).set(bearer(userToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].model).toBe('Bolt');
  });

  it('sorts by price in ascending order', async () => {
    const res = await api().get('/api/vehicles/search').query({ sortBy: 'price', sortOrder: 'asc' }).set(bearer(userToken));
    expect(res.status).toBe(200);
    expect(res.body.map((v: { price: number }) => v.price)).toEqual([25000, 40000, 75000]);
  });
});
