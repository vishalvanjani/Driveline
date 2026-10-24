import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { ForbiddenError, UnauthorizedError } from '../errors.js';
import type { Role } from '../modules/auth/auth.service.js';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

/** Verifies a `Bearer <jwt>` header and attaches the decoded user to the request. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(new UnauthorizedError('Missing bearer token'));

  try {
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    req.user = { id: String(payload.sub), email: String(payload.email), role: payload.role as Role };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

/** Must run after requireAuth. */
export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction) =>
    req.user?.role === role ? next() : next(new ForbiddenError(`Requires ${role} role`));
}
