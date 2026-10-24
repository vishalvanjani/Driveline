import { PrismaClient } from '@prisma/client';

/** Single shared client for the running server; tests inject their own via createApp(). */
export const prisma = new PrismaClient();
