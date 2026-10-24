import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { PrismaClient, User } from '@prisma/client';
import { config } from '../../config.js';
import { ConflictError, UnauthorizedError } from '../../errors.js';
import type { Credentials } from './auth.schemas.js';

export type Role = 'USER' | 'ADMIN';

export interface PublicUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

const SALT_ROUNDS = 10;
// A syntactically valid bcrypt hash that matches nothing; used so login timing is uniform.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8mYwOqN4m3S3U1ZQvMmcN5QxIm0ZxK';

export class AuthService {
  constructor(private readonly db: PrismaClient) {}

  async register({ email, password }: Credentials): Promise<AuthResult> {
    const existing = await this.db.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('Email is already registered');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.db.user.create({ data: { email, passwordHash } });
    return this.toAuthResult(user);
  }

  async login({ email, password }: Credentials): Promise<AuthResult> {
    const user = await this.db.user.findUnique({ where: { email } });
    // Compare even when the user is missing so timing doesn't reveal which emails exist.
    const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedError('Invalid email or password');
    return this.toAuthResult(user);
  }

  private toAuthResult(user: User): AuthResult {
    const token = jwt.sign({ email: user.email, role: user.role }, config.jwtSecret, {
      subject: user.id,
      expiresIn: config.jwtExpiresInSeconds,
    });
    return { user: toPublicUser(user), token };
  }
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email, role: user.role as Role };
}
