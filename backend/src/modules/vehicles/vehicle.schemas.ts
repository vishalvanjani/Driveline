import { z } from 'zod';

/** Empty strings from query params become undefined so they don't filter. */
const optionalText = z.string().trim().optional().transform((v) => (v ? v : undefined));
const optionalPrice = z.preprocess(
  (v) => (v === '' || v === undefined ? undefined : Number(v)),
  z.number().min(0).optional(),
);
const optionalInt = z.preprocess(
  (v) => (v === '' || v === undefined ? undefined : Number(v)),
  z.number().int().optional(),
);

export const vehicleSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  category: z.string().trim().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  year: z.number().int().min(1900).max(2100).optional(),
  vin: z.string().trim().optional(),
  mileage: z.number().int().min(0).optional(),
  fuelType: z.string().trim().optional(),
});

export const updateVehicleSchema = vehicleSchema.partial();

export const searchSchema = z
  .object({
    make: optionalText,
    model: optionalText,
    category: optionalText,
    minPrice: optionalPrice,
    maxPrice: optionalPrice,
    status: optionalText, // "in_stock" | "low_stock" | "out_of_stock"
    sortBy: optionalText, // "price" | "name" | "quantity" | "createdAt"
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
  .refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, {
    message: 'minPrice must be less than or equal to maxPrice',
    path: ['minPrice'],
  });

export const restockSchema = z.object({
  quantity: z.number().int().positive('Restock quantity must be at least 1'),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleUpdate = z.infer<typeof updateVehicleSchema>;
export type VehicleSearch = z.infer<typeof searchSchema>;
