import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { restockSchema, searchSchema, updateVehicleSchema, vehicleSchema } from './vehicle.schemas.js';
import type { VehicleService } from './vehicle.service.js';

export function createVehicleRouter(vehicles: VehicleService): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/', asyncHandler(async (_req, res) => {
    res.json(await vehicles.list());
  }));

  router.get('/search', asyncHandler(async (req, res) => {
    res.json(await vehicles.search(searchSchema.parse(req.query)));
  }));

  router.post('/', asyncHandler(async (req, res) => {
    res.status(201).json(await vehicles.create(vehicleSchema.parse(req.body)));
  }));

  router.put('/:id', asyncHandler(async (req, res) => {
    res.json(await vehicles.update(req.params.id, updateVehicleSchema.parse(req.body)));
  }));

  router.delete('/:id', requireRole('ADMIN'), asyncHandler(async (req, res) => {
    await vehicles.remove(req.params.id);
    res.status(204).end();
  }));

  router.post('/:id/purchase', asyncHandler(async (req, res) => {
    res.json(await vehicles.purchase(req.params.id, req.user!.id));
  }));

  router.post('/:id/restock', requireRole('ADMIN'), asyncHandler(async (req, res) => {
    const { quantity } = restockSchema.parse(req.body);
    res.json(await vehicles.restock(req.params.id, quantity));
  }));

  return router;
}
