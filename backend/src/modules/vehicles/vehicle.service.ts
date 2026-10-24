import type { Prisma, PrismaClient, Vehicle } from '@prisma/client';
import { ConflictError, NotFoundError } from '../../errors.js';
import type { VehicleInput, VehicleSearch, VehicleUpdate } from './vehicle.schemas.js';

export class VehicleService {
  constructor(private readonly db: PrismaClient) {}

  list(): Promise<Vehicle[]> {
    return this.db.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  }

  search(q: VehicleSearch): Promise<Vehicle[]> {
    const where: Prisma.VehicleWhereInput = {};
    // SQLite's LIKE is case-insensitive for ASCII; on Postgres add `mode: 'insensitive'`.
    if (q.make) where.make = { contains: q.make };
    if (q.model) where.model = { contains: q.model };
    if (q.category) where.category = { contains: q.category };
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = { gte: q.minPrice, lte: q.maxPrice };
    }
    return this.db.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  create(data: VehicleInput): Promise<Vehicle> {
    return this.db.vehicle.create({ data });
  }

  async update(id: string, data: VehicleUpdate): Promise<Vehicle> {
    await this.ensureExists(id);
    return this.db.vehicle.update({ where: { id }, data });
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.db.vehicle.delete({ where: { id } });
  }

  /**
   * Atomically decrements stock. The conditional updateMany means two concurrent
   * purchases of the last unit can't both succeed.
   */
  purchase(id: string, userId: string): Promise<Vehicle> {
    return this.db.$transaction(async (tx) => {
      const { count } = await tx.vehicle.updateMany({
        where: { id, quantity: { gt: 0 } },
        data: { quantity: { decrement: 1 } },
      });
      if (count === 0) {
        const exists = await tx.vehicle.findUnique({ where: { id } });
        if (!exists) throw new NotFoundError('Vehicle not found');
        throw new ConflictError('Vehicle is out of stock');
      }
      await tx.purchase.create({ data: { userId, vehicleId: id } });
      return tx.vehicle.findUniqueOrThrow({ where: { id } });
    });
  }

  async restock(id: string, quantity: number): Promise<Vehicle> {
    await this.ensureExists(id);
    return this.db.vehicle.update({ where: { id }, data: { quantity: { increment: quantity } } });
  }

  private async ensureExists(id: string): Promise<Vehicle> {
    const vehicle = await this.db.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    return vehicle;
  }
}
