import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Notification } from '@prisma/client';
import { NotificationFilterOptions } from './notifications.interface';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  /**
   * Dispatch / create a new notification for a user.
   * Consumed by Backend 3 or other internal domain services.
   */
  async sendNotification(
    userId: string,
    title: string,
    content: string,
  ): Promise<Notification> {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    return this.notificationsRepository.create({
      userId,
      title,
      content,
    });
  }

  /**
   * Retrieve all notifications for the authenticated user (newest first).
   * Consumed by Backend 1.
   */
  async getUserNotifications(
    userId: string,
    options?: NotificationFilterOptions,
  ): Promise<Notification[]> {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    return this.notificationsRepository.findByUserId(userId, options);
  }

  /**
   * Retrieve unread notification count for the authenticated user.
   * Consumed by Backend 1.
   */
  async getUnreadCount(userId: string): Promise<number> {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    return this.notificationsRepository.countUnread(userId);
  }

  /**
   * Mark a single notification as read, enforcing user ownership.
   * Consumed by Backend 1.
   */
  async markNotificationAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    if (!notificationId) {
      throw new BadRequestException('Notification ID is required.');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    return this.notificationsRepository.markAsRead(notificationId, userId);
  }

  /**
   * Mark all unread notifications as read for the authenticated user.
   * Consumed by Backend 1.
   */
  async markAllNotificationsAsRead(
    userId: string,
  ): Promise<{ count: number }> {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    return this.notificationsRepository.markAllAsRead(userId);
  }
}
