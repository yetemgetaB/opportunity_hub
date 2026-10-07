import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockRepository: any;

  const mockUserId = '11111111-1111-1111-1111-111111111111';
  const mockNotificationId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const mockNotification = {
    id: mockNotificationId,
    userId: mockUserId,
    title: 'Assessment Submitted',
    content: 'Your assessment answers have been received.',
    isRead: false,
    createdAt: new Date('2026-10-02T12:00:00Z'),
  };

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdempotencyKey: jest.fn(),
      findByUserId: jest.fn(),
      countUnread: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };

    service = new NotificationsService(
      mockRepository as unknown as NotificationsRepository,
    );
  });

  describe('sendNotification', () => {
    it('should delegate to repository.create with trimmed title and content', async () => {
      mockRepository.create.mockResolvedValue(mockNotification);

      const result = await service.sendNotification(
        mockUserId,
        'Assessment Submitted',
        'Your assessment answers have been received.',
      );

      expect(result).toEqual(mockNotification);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        title: 'Assessment Submitted',
        content: 'Your assessment answers have been received.',
        idempotencyKey: undefined,
      });
    });

    it('should delegate to repository.create with idempotencyKey', async () => {
      const idempotentNotif = {
        ...mockNotification,
        idempotencyKey: 'assessment_invitation:app-456',
      };
      mockRepository.create.mockResolvedValue(idempotentNotif);

      const result = await service.sendNotification(
        mockUserId,
        'Assessment Invitation',
        'You are invited to take an assessment.',
        'assessment_invitation:app-456',
      );

      expect(result).toEqual(idempotentNotif);
      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        title: 'Assessment Invitation',
        content: 'You are invited to take an assessment.',
        idempotencyKey: 'assessment_invitation:app-456',
      });
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(
        service.sendNotification('', 'Title', 'Content'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getNotificationByIdempotencyKey', () => {
    it('should delegate to repository.findByIdempotencyKey', async () => {
      mockRepository.findByIdempotencyKey.mockResolvedValue(mockNotification);

      const result = await service.getNotificationByIdempotencyKey(
        'assessment_invitation:app-456',
      );
      expect(result).toEqual(mockNotification);
      expect(mockRepository.findByIdempotencyKey).toHaveBeenCalledWith(
        'assessment_invitation:app-456',
      );
    });

    it('should return null if key is empty without calling repository', async () => {
      const result = await service.getNotificationByIdempotencyKey('');
      expect(result).toBeNull();
      expect(mockRepository.findByIdempotencyKey).not.toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    it('should delegate to repository.findByUserId with user options', async () => {
      mockRepository.findByUserId.mockResolvedValue([mockNotification]);

      const result = await service.getUserNotifications(mockUserId, {
        isRead: false,
        skip: 0,
        take: 20,
      });

      expect(result).toEqual([mockNotification]);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(mockUserId, {
        isRead: false,
        skip: 0,
        take: 20,
      });
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(service.getUserNotifications('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should delegate to repository.countUnread and return unread count', async () => {
      mockRepository.countUnread.mockResolvedValue(4);

      const result = await service.getUnreadCount(mockUserId);
      expect(result).toBe(4);
      expect(mockRepository.countUnread).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(service.getUnreadCount('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('markNotificationAsRead', () => {
    it('should delegate to repository.markAsRead with notificationId and userId', async () => {
      const readNotification = { ...mockNotification, isRead: true };
      mockRepository.markAsRead.mockResolvedValue(readNotification);

      const result = await service.markNotificationAsRead(
        mockNotificationId,
        mockUserId,
      );

      expect(result).toEqual(readNotification);
      expect(mockRepository.markAsRead).toHaveBeenCalledWith(
        mockNotificationId,
        mockUserId,
      );
    });

    it('should throw BadRequestException if notificationId is missing', async () => {
      await expect(
        service.markNotificationAsRead('', mockUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(
        service.markNotificationAsRead(mockNotificationId, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should propagate NotFoundException when repository rejects unowned notification', async () => {
      mockRepository.markAsRead.mockRejectedValue(
        new NotFoundException('Notification not found for this user.'),
      );

      await expect(
        service.markNotificationAsRead(mockNotificationId, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsRead (user-scoped)', () => {
    it('should mark a notification as read if owned by user', async () => {
      mockRepository.findById.mockResolvedValue(mockNotification);
      const readNotification = { ...mockNotification, isRead: true };
      mockRepository.markAsRead.mockResolvedValue(readNotification);

      const result = await service.markAsRead(mockUserId, mockNotificationId);
      expect(result).toEqual(readNotification);
      expect(mockRepository.findById).toHaveBeenCalledWith(mockNotificationId);
      expect(mockRepository.markAsRead).toHaveBeenCalledWith(mockNotificationId);
    });

    it('should throw NotFoundException if notification does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.markAsRead(mockUserId, 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if notification belongs to another user', async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockNotification,
        userId: 'different-user',
      });

      await expect(
        service.markAsRead(mockUserId, mockNotificationId),
      ).rejects.toThrow('Access denied: You can only update your own notifications.');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read and return message + count', async () => {
      mockRepository.markAllAsRead.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(mockUserId);
      expect(result).toEqual({
        message: 'All notifications marked as read.',
        count: 5,
      });
      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(service.markAllAsRead('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should delegate to repository.markAllAsRead and return count of updated notifications', async () => {
      mockRepository.markAllAsRead.mockResolvedValue({ count: 7 });

      const result = await service.markAllNotificationsAsRead(mockUserId);
      expect(result).toEqual({ count: 7 });
      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(
        service.markAllNotificationsAsRead(''),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
