import cors from 'cors';
import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { config } from './config.js';
import { errorHandler } from './middleware/error-handler.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { AuthService } from './modules/auth/auth.service.js';
import { createVehicleRouter } from './modules/vehicles/vehicle.routes.js';
import { VehicleService } from './modules/vehicles/vehicle.service.js';

/** App factory: the DB client is injected so tests and the server can supply their own. */
export function createApp(db: PrismaClient) {
  const app = express();
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter(new AuthService(db)));
  app.use('/api/vehicles', createVehicleRouter(new VehicleService(db)));

  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
  app.use(errorHandler);
  return app;
}
