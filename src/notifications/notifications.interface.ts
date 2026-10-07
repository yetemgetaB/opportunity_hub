import { Prisma } from '@prisma/client';

export interface CreateNotificationData {
  userId: string;
  title: string;
  content: string;
  idempotencyKey?: string;
}

export interface NotificationFilterOptions {
  isRead?: boolean;
  skip?: number;
  take?: number;
  orderBy?: Prisma.NotificationOrderByWithRelationInput;
}
