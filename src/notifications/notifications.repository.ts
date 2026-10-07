import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateNotificationData,
  NotificationFilterOptions,
} from './notifications.interface';

@Injectable()
export class NotificationsRepository {
  private readonly logger = new Logger(NotificationsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create and persist a new notification for a specific user.
   * If an idempotencyKey is provided and already exists in the database,
   * it prevents duplicate notification creation and returns the existing record.
   */
  async create(data: CreateNotificationData): Promise<Notification> {
    const trimmedTitle = data.title?.trim();
    const trimmedContent = data.content?.trim();
    const trimmedIdempotencyKey = data.idempotencyKey?.trim() || undefined;

    if (!data.userId) {
      throw new BadRequestException(
        'User ID is required for notification creation.',
      );
    }
    if (!trimmedTitle) {
      throw new BadRequestException('Notification title cannot be empty.');
    }
    if (!trimmedContent) {
      throw new BadRequestException('Notification content cannot be empty.');
    }

    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          title: trimmedTitle,
          content: trimmedContent,
          isRead: false,
          idempotencyKey: trimmedIdempotencyKey,
        },
      });

      this.logger.log(
        `Created notification ${notification.id} for user ${data.userId}`,
      );

      return notification;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002' && trimmedIdempotencyKey) {
          this.logger.warn(
            `Duplicate notification prevented for idempotencyKey: ${trimmedIdempotencyKey}. Returning existing record.`,
          );
          const existing = await this.prisma.notification.findUnique({
            where: { idempotencyKey: trimmedIdempotencyKey },
          });
          if (existing) {
            return existing;
          }
        }
        if (error.code === 'P2003' || error.code === 'P2025') {
          throw new NotFoundException(`User with ID ${data.userId} not found.`);
        }
      }
      throw error;
    }
  }

  /**
   * Look up a notification by its unique ID.
   */
  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  /**
   * Look up a notification by its unique idempotency key.
   */
  async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<Notification | null> {
    const trimmedKey = idempotencyKey?.trim();
    if (!trimmedKey) {
      return null;
    }
    return this.prisma.notification.findUnique({
      where: { idempotencyKey: trimmedKey },
    });
  }

  /**
   * Retrieve all notifications for a specific user.
   * Strictly returns notifications ordered newest first (createdAt: 'desc') by default.
   */
  async findByUserId(
    userId: string,
    options?: NotificationFilterOptions,
  ): Promise<Notification[]> {
    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    if (options?.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Count unread notifications for a specific user.
   */
  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Alias for countUnread.
   */
  async countUnreadByUserId(userId: string): Promise<number> {
    return this.countUnread(userId);
  }

  /**
   * Mark a single notification as read.
   * If userId is supplied, verifies user ownership and enforces tenant isolation.
   */
  async markAsRead(id: string, userId?: string): Promise<Notification> {
    if (userId) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existing) {
        throw new NotFoundException(
          `Notification with ID ${id} not found for this user.`,
        );
      }

      if (existing.isRead) {
        return existing;
      }
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all unread notifications as read for a specific user.
   * Strictly scoped to the supplied userId.
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { count: result.count };
  }
}
