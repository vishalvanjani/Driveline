import type { PrismaClient } from '@prisma/client';

export interface CustomerSummary {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  purchaseCount: number;
  totalSpent: number;
}

export class CustomersService {
  constructor(private readonly db: PrismaClient) {}

  async list(): Promise<CustomerSummary[]> {
    const users = await this.db.user.findMany({
      include: {
        purchases: {
          include: { vehicle: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => {
      const totalSpent = u.purchases.reduce((sum, p) => sum + (p.pricePaid ?? p.vehicle.price), 0);
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        purchaseCount: u.purchases.length,
        totalSpent,
      };
    });
  }
}
