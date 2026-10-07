import { Notification } from '@prisma/client';

export interface CreateNotificationData {
  userId: string;
  title: string;
  content: string;
}

export interface NotificationListOptions {
  skip?: number;
  take?: number;
}

export type NotificationRecord = Notification;