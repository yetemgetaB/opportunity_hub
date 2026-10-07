import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import {
  CreateNotificationData,
  NotificationListOptions,
} from './notifications.interface';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async create(data: CreateNotificationData) {
    return this.notificationsRepository.create(data);
  }

  async getMyNotifications(
    userId: string,
    options?: NotificationListOptions,
  ) {
    return this.notificationsRepository.findByUserId(userId, options);
  }

  async getUnreadCount(userId: string) {
    return this.notificationsRepository.countUnreadByUserId(userId);
  }

  async markAsRead(userId: string, notificationId: string) {
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

  async markAllAsRead(userId: string) {
    const result =
      await this.notificationsRepository.markAllAsRead(userId);

    return {
      message: 'All notifications marked as read.',
      count: result.count,
    };
  }
}