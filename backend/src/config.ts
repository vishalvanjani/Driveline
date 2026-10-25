import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret',
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 86400),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  lowStockThreshold: Number(process.env.LOW_STOCK_THRESHOLD ?? 2),
} as const;
