import type { PrismaClient } from '@prisma/client';
import { config } from '../../config.js';

export interface DashboardKpis {
  totalVehicles: number;
  availableVehicles: number;
  unitsSold: number;
  totalInventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalRevenue: number;
  lowStockThreshold: number;
  categoryDistribution: {
    category: string;
    modelCount: number;
    totalStock: number;
    inventoryValue: number;
  }[];
  topSellingModels: {
    vehicleId: string;
    make: string;
    model: string;
    category: string;
    unitsSold: number;
    revenue: number;
  }[];
}

export class AnalyticsService {
  constructor(private readonly db: PrismaClient) {}

  async getKpis(): Promise<DashboardKpis> {
    const vehicles = await this.db.vehicle.findMany();
    const purchases = await this.db.purchase.findMany({
      include: { vehicle: true },
    });

    let availableVehicles = 0;
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const categoryMap = new Map<string, { modelCount: number; totalStock: number; inventoryValue: number }>();

    for (const v of vehicles) {
      availableVehicles += v.quantity;
      totalInventoryValue += v.price * v.quantity;

      if (v.quantity === 0) {
        outOfStockCount += 1;
      } else if (v.quantity <= config.lowStockThreshold) {
        lowStockCount += 1;
      }

      const existingCat = categoryMap.get(v.category) ?? { modelCount: 0, totalStock: 0, inventoryValue: 0 };
      existingCat.modelCount += 1;
      existingCat.totalStock += v.quantity;
      existingCat.inventoryValue += v.price * v.quantity;
      categoryMap.set(v.category, existingCat);
    }

    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      ...stats,
    }));

    let totalRevenue = 0;
    const vehicleSalesMap = new Map<string, { make: string; model: string; category: string; unitsSold: number; revenue: number }>();

    for (const p of purchases) {
      const price = p.pricePaid ?? p.vehicle.price;
      totalRevenue += price;

      const existing = vehicleSalesMap.get(p.vehicleId) ?? {
        make: p.vehicle.make,
        model: p.vehicle.model,
        category: p.vehicle.category,
        unitsSold: 0,
        revenue: 0,
      };
      existing.unitsSold += 1;
      existing.revenue += price;
      vehicleSalesMap.set(p.vehicleId, existing);
    }

    const topSellingModels = Array.from(vehicleSalesMap.entries())
      .map(([vehicleId, stats]) => ({ vehicleId, ...stats }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    return {
      totalVehicles: vehicles.length,
      availableVehicles,
      unitsSold: purchases.length,
      totalInventoryValue,
      lowStockCount,
      outOfStockCount,
      totalRevenue,
      lowStockThreshold: config.lowStockThreshold,
      categoryDistribution,
      topSellingModels,
    };
  }
}
