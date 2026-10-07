import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsModule } from '@/notifications/notifications.module';
import { NotificationsService } from '@/notifications/notifications.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('Notifications Authorization & Cross-User Isolation Integration', () => {
  let service: NotificationsService;

  const userA = '11111111-1111-1111-1111-111111111111';
  const userB = '22222222-2222-2222-2222-222222222222';

  let notificationStore: Map<string, any>;

  beforeEach(async () => {
    notificationStore = new Map<string, any>([
      [
        'notif-a1',
        {
          id: 'notif-a1',
          userId: userA,
          title: 'User A Notif 1',
          content: 'Content A1',
          isRead: false,
          createdAt: new Date('2026-10-01T10:00:00Z'),
        },
      ],
      [
        'notif-a2',
        {
          id: 'notif-a2',
          userId: userA,
          title: 'User A Notif 2',
          content: 'Content A2',
          isRead: true,
          createdAt: new Date('2026-10-02T10:00:00Z'),
        },
      ],
      [
        'notif-b1',
        {
          id: 'notif-b1',
          userId: userB,
          title: 'User B Notif 1',
          content: 'Content B1',
          isRead: false,
          createdAt: new Date('2026-10-03T10:00:00Z'),
        },
      ],
    ]);

    const mockPrisma = {
      notification: {
        create: jest.fn(async ({ data }) => {
          if (data.idempotencyKey) {
            const existingWithKey = Array.from(notificationStore.values()).find(
              (n) => n.idempotencyKey === data.idempotencyKey,
            );
            if (existingWithKey) {
              const { Prisma } = await import('@prisma/client');
              throw new Prisma.PrismaClientKnownRequestError(
                'Unique constraint failed on the fields: (`idempotency_key`)',
                {
                  code: 'P2002',
                  clientVersion: '5.22.0',
                },
              );
            }
          }
          const created = {
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            userId: data.userId,
            title: data.title,
            content: data.content,
            isRead: false,
            idempotencyKey: data.idempotencyKey,
            createdAt: new Date(),
          };
          notificationStore.set(created.id, created);
          return created;
        }),
        findUnique: jest.fn(async ({ where }) => {
          if (where.id) return notificationStore.get(where.id) || null;
          if (where.idempotencyKey) {
            return (
              Array.from(notificationStore.values()).find(
                (n) => n.idempotencyKey === where.idempotencyKey,
              ) || null
            );
          }
          return null;
        }),
        findFirst: jest.fn(async ({ where }) => {
          return (
            Array.from(notificationStore.values()).find((n) => {
              if (where.id && n.id !== where.id) return false;
              if (where.userId && n.userId !== where.userId) return false;
              return true;
            }) || null
          );
        }),
        findMany: jest.fn(async ({ where, orderBy, skip, take }) => {
          let list = Array.from(notificationStore.values()).filter((n) => {
            if (where.userId && n.userId !== where.userId) return false;
            if (where.isRead !== undefined && n.isRead !== where.isRead)
              return false;
            return true;
          });
          if (orderBy?.createdAt === 'desc') {
            list.sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            );
          }
          if (skip !== undefined) {
            list = list.slice(skip);
          }
          if (take !== undefined) {
            list = list.slice(0, take);
          }
          return list;
        }),
        count: jest.fn(async ({ where }) => {
          return Array.from(notificationStore.values()).filter((n) => {
            if (where.userId && n.userId !== where.userId) return false;
            if (where.isRead !== undefined && n.isRead !== where.isRead)
              return false;
            return true;
          }).length;
        }),
        update: jest.fn(async ({ where, data }) => {
          const item = notificationStore.get(where.id);
          if (!item) throw new Error('Record to update not found.');
          const updated = { ...item, ...data };
          notificationStore.set(where.id, updated);
          return updated;
        }),
        updateMany: jest.fn(async ({ where, data }) => {
          let count = 0;
          for (const [id, item] of notificationStore.entries()) {
            let matches = true;
            if (where.userId && item.userId !== where.userId) matches = false;
            if (where.isRead !== undefined && item.isRead !== where.isRead)
              matches = false;
            if (matches) {
              notificationStore.set(id, { ...item, ...data });
              count++;
            }
          }
          return { count };
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('Strict Multi-Tenant Notification Isolation', () => {
    it('User A should only see their own notifications in descending date order', async () => {
      const userANotifs = await service.getUserNotifications(userA);

      expect(userANotifs).toHaveLength(2);
      expect(userANotifs.every((n) => n.userId === userA)).toBe(true);
      expect(userANotifs[0].id).toBe('notif-a2'); // newer
      expect(userANotifs[1].id).toBe('notif-a1'); // older
    });

    it('User B should only see their own notification', async () => {
      const userBNotifs = await service.getUserNotifications(userB);

      expect(userBNotifs).toHaveLength(1);
      expect(userBNotifs[0].id).toBe('notif-b1');
      expect(userBNotifs[0].userId).toBe(userB);
    });

    it('User A cannot mark User B notification as read (throws NotFoundException)', async () => {
      await expect(
        service.markNotificationAsRead('notif-b1', userA),
      ).rejects.toThrow(NotFoundException);

      // Verify User B's notification state was not modified
      const notifB = notificationStore.get('notif-b1');
      expect(notifB.isRead).toBe(false);
    });

    it('User A marking all as read only updates User A notifications and leaves User B untouched', async () => {
      const unreadBeforeA = await service.getUnreadCount(userA);
      const unreadBeforeB = await service.getUnreadCount(userB);

      expect(unreadBeforeA).toBe(1); // notif-a1 is unread
      expect(unreadBeforeB).toBe(1); // notif-b1 is unread

      const result = await service.markAllNotificationsAsRead(userA);
      expect(result.count).toBe(1);

      const unreadAfterA = await service.getUnreadCount(userA);
      const unreadAfterB = await service.getUnreadCount(userB);

      expect(unreadAfterA).toBe(0);
      expect(unreadAfterB).toBe(1); // User B still has 1 unread notification

      const notifB = notificationStore.get('notif-b1');
      expect(notifB.isRead).toBe(false);
    });

    it('prevent duplicate notifications when sending with identical idempotencyKey', async () => {
      const idempotencyKey = 'assessment_invitation:app-test-999';

      const first = await service.sendNotification(
        userA,
        'Assessment Invitation',
        'Please complete your technical assessment.',
        idempotencyKey,
      );

      expect(first).toBeDefined();
      expect(first.idempotencyKey).toBe(idempotencyKey);

      // Attempt second identical notification (e.g. retry / race condition)
      const second = await service.sendNotification(
        userA,
        'Assessment Invitation',
        'Please complete your technical assessment.',
        idempotencyKey,
      );

      // Must return the exact same existing notification without duplicating
      expect(second.id).toBe(first.id);
      expect(second.idempotencyKey).toBe(idempotencyKey);

      // Verify total notifications in store for userA did not increase twice
      const userANotifs = await service.getUserNotifications(userA);
      const matching = userANotifs.filter((n) => n.idempotencyKey === idempotencyKey);
      expect(matching).toHaveLength(1);
    });
  });
});
