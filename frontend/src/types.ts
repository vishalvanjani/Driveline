export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number | null;
  vin?: string | null;
  mileage?: number | null;
  fuelType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number;
  vin?: string;
  mileage?: number;
  fuelType?: string;
}

export interface VehicleFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

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

export interface SaleRecord {
  id: string;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleCategory: string;
  pricePaid: number;
  buyerId: string;
  buyerEmail: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'PURCHASED' | 'RESTOCKED' | string;
  details: string;
  userId?: string | null;
  vehicleId?: string | null;
  createdAt: string;
}

export interface CustomerSummary {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  purchaseCount: number;
  totalSpent: number;
}
