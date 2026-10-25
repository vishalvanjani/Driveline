import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/auth.js';
import type { ActivityService } from './activity.service.js';

export function createActivityRouter(activity: ActivityService): Router {
  const router = Router();
  router.use(requireAuth);

  router.get('/', asyncHandler(async (_req, res) => {
    res.json(await activity.list());
  }));

  return router;
}
