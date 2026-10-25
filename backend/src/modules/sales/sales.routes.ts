import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/auth.js';
import type { SalesService } from './sales.service.js';

export function createSalesRouter(sales: SalesService): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await sales.list(req.user!));
  }));

  return router;
}
