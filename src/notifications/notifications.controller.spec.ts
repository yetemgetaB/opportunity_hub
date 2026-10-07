import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let mockNotificationsService: any;

  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockNotificationId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const mockNotification = {
    id: mockNotificationId,
    userId: mockUserId,
    title: 'Test Notification',
    content: 'Content test',
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockNotificationsService = {
      getMyNotifications: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  describe('getMyNotifications', () => {
    it('should retrieve notifications for the current authenticated user', async () => {
      mockNotificationsService.getMyNotifications.mockResolvedValue([
        mockNotification,
      ]);

      const result = await controller.getMyNotifications(
        mockUserId,
        '0',
        '20',
      );

      expect(result).toEqual([mockNotification]);
      expect(mockNotificationsService.getMyNotifications).toHaveBeenCalledWith(
        mockUserId,
        {
          skip: 0,
          take: 20,
        },
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should retrieve unread notification count', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(mockUserId);
      expect(result).toEqual({ count: 5 });
      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const readNotif = { ...mockNotification, isRead: true };
      mockNotificationsService.markAsRead.mockResolvedValue(readNotif);

      const result = await controller.markAsRead(
        mockUserId,
        mockNotificationId,
      );

      expect(result).toEqual(readNotif);
      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(
        mockUserId,
        mockNotificationId,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue({
        message: 'All notifications marked as read.',
        count: 3,
      });

      const result = await controller.markAllAsRead(mockUserId);
      expect(result).toEqual({
        message: 'All notifications marked as read.',
        count: 3,
      });
      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });
});
