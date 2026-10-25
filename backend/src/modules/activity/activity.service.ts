import type { ActivityLog, PrismaClient } from '@prisma/client';

export class ActivityService {
  constructor(private readonly db: PrismaClient) {}

  list(limit = 20): Promise<ActivityLog[]> {
    return this.db.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
