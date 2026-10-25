import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/auth.js';
import type { AnalyticsService } from './analytics.service.js';

export function createAnalyticsRouter(analytics: AnalyticsService): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/kpis', asyncHandler(async (_req, res) => {
    res.json(await analytics.getKpis());
  }));

  return router;
}
