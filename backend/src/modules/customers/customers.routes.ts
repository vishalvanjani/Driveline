import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import type { CustomersService } from './customers.service.js';

export function createCustomersRouter(customers: CustomersService): Router {
  const router = Router();
  router.use(requireAuth);
  router.use(requireRole('ADMIN'));

  router.get('/', asyncHandler(async (_req, res) => {
    res.json(await customers.list());
  }));

  return router;
}
