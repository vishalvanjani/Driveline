import type { Prisma, PrismaClient, Vehicle } from '@prisma/client';
import { config } from '../../config.js';
import { ConflictError, NotFoundError } from '../../errors.js';
import type { VehicleInput, VehicleSearch, VehicleUpdate } from './vehicle.schemas.js';

export class VehicleService {
  constructor(private readonly db: PrismaClient) {}

  list(): Promise<Vehicle[]> {
    return this.db.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async search(q: VehicleSearch): Promise<Vehicle[]> {
    const where: Prisma.VehicleWhereInput = {};
    if (q.make) where.make = { contains: q.make };
    if (q.model) where.model = { contains: q.model };
    if (q.category) where.category = { contains: q.category };
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.price = { gte: q.minPrice, lte: q.maxPrice };
    }

    if (q.status === 'out_of_stock') {
      where.quantity = 0;
    } else if (q.status === 'low_stock') {
      where.quantity = { gt: 0, lte: config.lowStockThreshold };
    } else if (q.status === 'in_stock') {
      where.quantity = { gt: config.lowStockThreshold };
    }

    // Determine ordering
    let orderBy: Prisma.VehicleOrderByWithRelationInput = { createdAt: 'desc' };
    const direction = q.sortOrder ?? (q.sortBy === 'price' ? 'asc' : 'desc');

    if (q.sortBy === 'price') {
      orderBy = { price: direction };
    } else if (q.sortBy === 'name') {
      orderBy = { make: direction };
    } else if (q.sortBy === 'quantity') {
      orderBy = { quantity: direction };
    } else if (q.sortBy === 'createdAt') {
      orderBy = { createdAt: direction };
    }

    return this.db.vehicle.findMany({ where, orderBy });
  }

  create(data: VehicleInput, userId?: string): Promise<Vehicle> {
    return this.db.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.create({ data });
      await tx.activityLog.create({
        data: {
          action: 'CREATED',
          details: `Added new vehicle: ${vehicle.make} ${vehicle.model} ($${vehicle.price})`,
          userId,
          vehicleId: vehicle.id,
        },
      });
      return vehicle;
    });
  }

  async update(id: string, data: VehicleUpdate, userId?: string): Promise<Vehicle> {
    return this.db.$transaction(async (tx) => {
      await this.ensureExists(id, tx);
      const updated = await tx.vehicle.update({ where: { id }, data });
      await tx.activityLog.create({
        data: {
          action: 'UPDATED',
          details: `Updated vehicle details: ${updated.make} ${updated.model}`,
          userId,
          vehicleId: updated.id,
        },
      });
      return updated;
    });
  }

  async remove(id: string, userId?: string): Promise<void> {
    return this.db.$transaction(async (tx) => {
      const vehicle = await this.ensureExists(id, tx);
      await tx.vehicle.delete({ where: { id } });
      await tx.activityLog.create({
        data: {
          action: 'DELETED',
          details: `Removed vehicle: ${vehicle.make} ${vehicle.model}`,
          userId,
          vehicleId: id,
        },
      });
    });
  }

  /**
   * Atomically decrements stock and records the customer sale.
   * The conditional updateMany ensures concurrent purchases of the last unit cannot both succeed.
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
      const vehicle = await tx.vehicle.findUniqueOrThrow({ where: { id } });
      await tx.purchase.create({
        data: {
          userId,
          vehicleId: id,
          pricePaid: vehicle.price,
        },
      });
      await tx.activityLog.create({
        data: {
          action: 'PURCHASED',
          details: `Customer purchased 1 unit of ${vehicle.make} ${vehicle.model} for $${vehicle.price}`,
          userId,
          vehicleId: id,
        },
      });
      return vehicle;
    });
  }

  async restock(id: string, quantity: number, userId?: string): Promise<Vehicle> {
    return this.db.$transaction(async (tx) => {
      const vehicle = await this.ensureExists(id, tx);
      const updated = await tx.vehicle.update({
        where: { id },
        data: { quantity: { increment: quantity } },
      });
      await tx.activityLog.create({
        data: {
          action: 'RESTOCKED',
          details: `Restocked ${quantity} units of ${updated.make} ${updated.model} (Total in stock: ${updated.quantity})`,
          userId,
          vehicleId: id,
        },
      });
      return updated;
    });
  }

  private async ensureExists(id: string, client: PrismaClient | Prisma.TransactionClient = this.db): Promise<Vehicle> {
    const vehicle = await client.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    return vehicle;
  }
}
