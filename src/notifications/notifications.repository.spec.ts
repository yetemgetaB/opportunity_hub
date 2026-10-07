import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsRepository } from './notifications.repository';

describe('NotificationsRepository', () => {
  let repository: NotificationsRepository;
  let mockPrisma: any;

  const mockUser1Id = '11111111-1111-1111-1111-111111111111';
  const mockUser2Id = '22222222-2222-2222-2222-222222222222';
  const mockNotification1Id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const mockNotification2Id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const mockNotification1 = {
    id: mockNotification1Id,
    userId: mockUser1Id,
    title: 'Application Shortlisted',
    content: 'Your application for Frontend Intern has been shortlisted.',
    isRead: false,
    createdAt: new Date('2026-10-01T10:00:00Z'),
  };

  const mockNotification2 = {
    id: mockNotification2Id,
    userId: mockUser1Id,
    title: 'New Assessment Assigned',
    content: 'Please complete your assessment before the deadline.',
    isRead: true,
    createdAt: new Date('2026-09-30T10:00:00Z'),
  };

  beforeEach(() => {
    mockPrisma = {
      notification: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    repository = new NotificationsRepository(
      mockPrisma as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('should create and return a notification for a user', async () => {
      mockPrisma.notification.create.mockResolvedValue(mockNotification1);

      const result = await repository.create({
        userId: mockUser1Id,
        title: 'Application Shortlisted',
        content:
          'Your application for Frontend Intern has been shortlisted.',
      });

      expect(result).toEqual(mockNotification1);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser1Id,
          title: 'Application Shortlisted',
          content:
            'Your application for Frontend Intern has been shortlisted.',
          isRead: false,
          idempotencyKey: undefined,
        },
      });
    });

    it('should create a notification with an idempotencyKey', async () => {
      const idempotentNotif = {
        ...mockNotification1,
        idempotencyKey: 'assessment_invitation:app-123',
      };
      mockPrisma.notification.create.mockResolvedValue(idempotentNotif);

      const result = await repository.create({
        userId: mockUser1Id,
        title: 'Assessment Invitation',
        content: 'You are invited to take an assessment.',
        idempotencyKey: 'assessment_invitation:app-123',
      });

      expect(result).toEqual(idempotentNotif);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser1Id,
          title: 'Assessment Invitation',
          content: 'You are invited to take an assessment.',
          isRead: false,
          idempotencyKey: 'assessment_invitation:app-123',
        },
      });
    });

    it('should catch P2002 unique constraint error and return existing notification for duplicate idempotencyKey', async () => {
      const existingNotif = {
        ...mockNotification1,
        idempotencyKey: 'assessment_invitation:app-123',
      };
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`idempotency_key`)',
        {
          code: 'P2002',
          clientVersion: '5.22.0',
        },
      );
      mockPrisma.notification.create.mockRejectedValue(p2002Error);
      mockPrisma.notification.findUnique.mockResolvedValue(existingNotif);

      const result = await repository.create({
        userId: mockUser1Id,
        title: 'Assessment Invitation',
        content: 'You are invited to take an assessment.',
        idempotencyKey: 'assessment_invitation:app-123',
      });

      expect(result).toEqual(existingNotif);
      expect(mockPrisma.notification.findUnique).toHaveBeenCalledWith({
        where: { idempotencyKey: 'assessment_invitation:app-123' },
      });
    });

    it('should throw BadRequestException if userId is missing', async () => {
      await expect(
        repository.create({
          userId: '',
          title: 'Test',
          content: 'Content',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if title is empty', async () => {
      await expect(
        repository.create({
          userId: mockUser1Id,
          title: '   ',
          content: 'Content',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if content is empty', async () => {
      await expect(
        repository.create({
          userId: mockUser1Id,
          title: 'Title',
          content: '   ',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if foreign key fails (user not found)', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Foreign key failed', {
        code: 'P2003',
        clientVersion: '5.22.0',
      });
      mockPrisma.notification.create.mockRejectedValue(error);

      await expect(
        repository.create({
          userId: 'non-existent-user',
          title: 'Title',
          content: 'Content',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a notification by its unique ID', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(mockNotification1);

      const result = await repository.findById(mockNotification1Id);
      expect(result).toEqual(mockNotification1);
      expect(mockPrisma.notification.findUnique).toHaveBeenCalledWith({
        where: { id: mockNotification1Id },
      });
    });

    it('should return null if notification is not found', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('findByIdempotencyKey', () => {
    it('should return a notification by its idempotencyKey', async () => {
      const notif = {
        ...mockNotification1,
        idempotencyKey: 'assessment_invitation:app-123',
      };
      mockPrisma.notification.findUnique.mockResolvedValue(notif);

      const result = await repository.findByIdempotencyKey(
        'assessment_invitation:app-123',
      );
      expect(result).toEqual(notif);
      expect(mockPrisma.notification.findUnique).toHaveBeenCalledWith({
        where: { idempotencyKey: 'assessment_invitation:app-123' },
      });
    });

    it('should return null if idempotencyKey is empty or not found', async () => {
      expect(await repository.findByIdempotencyKey('')).toBeNull();
      expect(await repository.findByIdempotencyKey('   ')).toBeNull();

      mockPrisma.notification.findUnique.mockResolvedValue(null);
      expect(
        await repository.findByIdempotencyKey('non-existent-key'),
      ).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return all notifications for a user ordered by createdAt DESC', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([
        mockNotification1,
        mockNotification2,
      ]);

      const result = await repository.findByUserId(mockUser1Id);
      expect(result).toEqual([mockNotification1, mockNotification2]);
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser1Id },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('should filter notifications by isRead = false', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([mockNotification1]);

      const result = await repository.findByUserId(mockUser1Id, {
        isRead: false,
      });
      expect(result).toEqual([mockNotification1]);
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser1Id, isRead: false },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('should apply pagination options (skip, take)', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([mockNotification2]);

      const result = await repository.findByUserId(mockUser1Id, {
        skip: 1,
        take: 10,
      });
      expect(result).toEqual([mockNotification2]);
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser1Id },
        orderBy: { createdAt: 'desc' },
        skip: 1,
        take: 10,
      });
    });
  });

  describe('countUnread', () => {
    it('should return the count of unread notifications for a user', async () => {
      mockPrisma.notification.count.mockResolvedValue(3);

      const result = await repository.countUnread(mockUser1Id);
      expect(result).toBe(3);
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: {
          userId: mockUser1Id,
          isRead: false,
        },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark an unread notification as read when owned by the user', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(mockNotification1);
      const updatedNotification = { ...mockNotification1, isRead: true };
      mockPrisma.notification.update.mockResolvedValue(updatedNotification);

      const result = await repository.markAsRead(
        mockNotification1Id,
        mockUser1Id,
      );

      expect(result.isRead).toBe(true);
      expect(mockPrisma.notification.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockNotification1Id,
          userId: mockUser1Id,
        },
      });
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: mockNotification1Id },
        data: { isRead: true },
      });
    });

    it('should return already read notification without calling update', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(mockNotification2);

      const result = await repository.markAsRead(
        mockNotification2Id,
        mockUser1Id,
      );

      expect(result).toEqual(mockNotification2);
      expect(mockPrisma.notification.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when notification belongs to a different user', async () => {
      // Notification belongs to User 2, but User 1 tries to mark it as read
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await expect(
        repository.markAsRead(mockNotification1Id, mockUser2Id),
      ).rejects.toThrow(NotFoundException);

      expect(mockPrisma.notification.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockNotification1Id,
          userId: mockUser2Id,
        },
      });
      expect(mockPrisma.notification.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when notification ID does not exist', async () => {
      mockPrisma.notification.findFirst.mockResolvedValue(null);

      await expect(
        repository.markAsRead('non-existent-id', mockUser1Id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read for a specific user and return updated count', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await repository.markAllAsRead(mockUser1Id);

      expect(result).toEqual({ count: 5 });
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser1Id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    });

    it('should strictly scope bulk update to the provided userId', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 0 });

      await repository.markAllAsRead(mockUser2Id);

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser2Id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    });
  });
});
