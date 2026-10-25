import type { PrismaClient } from '@prisma/client';
import type { AuthUser } from '../../middleware/auth.js';

export interface SaleRecord {
  id: string;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleCategory: string;
  pricePaid: number;
  buyerId: string;
  buyerEmail: string;
  createdAt: Date;
}

export class SalesService {
  constructor(private readonly db: PrismaClient) {}

  async list(user: AuthUser): Promise<SaleRecord[]> {
    const where = user.role === 'ADMIN' ? {} : { userId: user.id };
    const purchases = await this.db.purchase.findMany({
      where,
      include: {
        vehicle: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return purchases.map((p) => ({
      id: p.id,
      vehicleId: p.vehicleId,
      vehicleMake: p.vehicle.make,
      vehicleModel: p.vehicle.model,
      vehicleCategory: p.vehicle.category,
      pricePaid: p.pricePaid ?? p.vehicle.price,
      buyerId: p.userId,
      buyerEmail: p.user.email,
      createdAt: p.createdAt,
    }));
  }
}
