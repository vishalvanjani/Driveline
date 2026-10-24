import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { credentialsSchema } from './auth.schemas.js';
import type { AuthService } from './auth.service.js';

export function createAuthRouter(auth: AuthService): Router {
  const router = Router();

  router.post('/register', asyncHandler(async (req, res) => {
    const result = await auth.register(credentialsSchema.parse(req.body));
    res.status(201).json(result);
  }));

  router.post('/login', asyncHandler(async (req, res) => {
    res.json(await auth.login(credentialsSchema.parse(req.body)));
  }));

  return router;
}
