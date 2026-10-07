import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Notification } from '@prisma/client';
import {
  CreateNotificationData,
  NotificationFilterOptions,
  NotificationListOptions,
} from './notifications.interface';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  /**
   * Create and persist a new notification.
   */
  async create(data: CreateNotificationData): Promise<Notification> {
    return this.notificationsRepository.create(data);
  }

  /**
   * Dispatch / create a new notification for a user.
   * If idempotencyKey is supplied, duplicate notifications for the same key are safely prevented.
   * Consumed by Backend 3 or other internal domain services.
   */
  async sendNotification(
    userId: string,
    title: string,
    content: string,
    idempotencyKey?: string,
  ): Promise<Notification> {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    return this.notificationsRepository.create({
      userId,
      title,
      content,
      idempotencyKey,
    });
  }

  /**
   * Retrieve a notification by its unique idempotency key.
   */
  async getNotificationByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Notification | null> {
    if (!idempotencyKey?.trim()) {
      return null;
    }
    return this.notificationsRepository.findByIdempotencyKey(idempotencyKey);
  }

  /**
   * Retrieve all notifications for the authenticated user (newest first).
   */
  async getMyNotifications(
    userId: string,
    options?: NotificationListOptions,
  ): Promise<Notification[]> {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    return this.notificationsRepository.findByUserId(userId, options);
  }

  /**
   * Retrieve all notifications for the authenticated user (newest first).
   * Consumed by Backend 1 / internal callers.
   */
  async getUserNotifications(
    userId: string,
    options?: NotificationFilterOptions,
  ): Promise<Notification[]> {
    return this.getMyNotifications(userId, options);
  }

  /**
   * Retrieve unread notification count for the authenticated user.
   */
  async getUnreadCount(userId: string): Promise<number> {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    return this.notificationsRepository.countUnread(userId);
  }

  /**
   * Mark a single notification as read, enforcing user ownership.
   */
  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<Notification> {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    if (!notificationId) {
      throw new BadRequestException('Notification ID is required.');
    }

    const notification =
      await this.notificationsRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found.');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only update your own notifications.',
      );
    }

    return this.notificationsRepository.markAsRead(notificationId);
  }

  /**
   * Mark a single notification as read, enforcing user ownership.
   * Consumed by Backend 1 / internal callers.
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
   */
  async markAllAsRead(
    userId: string,
  ): Promise<{ message: string; count: number }> {
    if (!userId) {
      throw new BadRequestException('User ID is required.');
    }
    const result = await this.notificationsRepository.markAllAsRead(userId);
    return {
      message: 'All notifications marked as read.',
      count: result.count,
    };
  }

  /**
   * Mark all unread notifications as read for the authenticated user.
   * Consumed by Backend 1 / internal callers.
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
