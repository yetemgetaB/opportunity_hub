import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../../src/users/users.module';
import { UsersService } from '../../src/users/users.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

describe('User + Role Database Integration (Backend 1 <-> Backend 2 Contract)', () => {
  let module: TestingModule;
  let usersService: UsersService;
  let mockPrisma: any;

  // In-memory mock database store for integration simulation
  const inMemoryUsers = new Map<string, any>();

  beforeAll(async () => {
    mockPrisma = {
      user: {
        findUnique: jest.fn().mockImplementation(async ({ where }) => {
          return inMemoryUsers.get(where.id) || null;
        }),

        create: jest.fn().mockImplementation(async ({ data }) => {
          if (inMemoryUsers.has(data.id)) {
            const err = new Error(
              'Unique constraint failed on the fields: (`id`)',
            );

            (err as any).code = 'P2002';
            throw err;
          }

          const record = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };

          inMemoryUsers.set(data.id, record);

          return record;
        }),

        findFirst: jest.fn().mockImplementation(async ({ where }) => {
          const user = inMemoryUsers.get(where.id);

          if (!user) {
            return null;
          }

          if (
            where.isActive !== undefined &&
            user.isActive !== where.isActive
          ) {
            return null;
          }

          if (where.deletedAt === null && user.deletedAt !== null) {
            return null;
          }

          return user;
        }),
      },
    };

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PrismaModule,
        UsersModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    usersService = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  beforeEach(() => {
    inMemoryUsers.clear();
  });

  it(
    'Flow: User registers via Supabase Auth -> App user record created -> Role retrieved by Auth ID',
    async () => {
      // 1. Supabase Auth generates a UUID for the newly registered student
      const supabaseAuthUserId =
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

      // 2. Application creates corresponding public.users record
      const createdUser = await usersService.createApplicationUser({
        id: supabaseAuthUserId,
        firstName: 'Jane',
        lastName: 'Student',
        role: UserRole.STUDENT,
      });

      expect(createdUser.id).toBe(supabaseAuthUserId);
      expect(createdUser.role).toBe(UserRole.STUDENT);

      // 3. Subsequent request: Backend 1 inspects JWT sub (auth UID)
      // and retrieves role
      const roleInfo =
        await usersService.getRoleByAuthId(supabaseAuthUserId);

      expect(roleInfo.id).toBe(supabaseAuthUserId);
      expect(roleInfo.role).toBe(UserRole.STUDENT);
      expect(roleInfo.isActive).toBe(true);
      expect(roleInfo.isDeleted).toBe(false);
    },
  );

  it(
    'Security: Duplicate user record creation with same Auth ID must be rejected',
    async () => {
      const supabaseAuthUserId =
        'b1ffcd88-8b1a-3ef7-aa5c-5aa8ac270b22';

      await usersService.createApplicationUser({
        id: supabaseAuthUserId,
        firstName: 'Acme',
        lastName: 'Recruiter',
        role: UserRole.ORGANIZATION,
      });

      // Second registration attempt with duplicate auth ID
      await expect(
        usersService.createApplicationUser({
          id: supabaseAuthUserId,
          firstName: 'Duplicate',
          lastName: 'Account',
          role: UserRole.ORGANIZATION,
        }),
      ).rejects.toThrow();
    },
  );

  it(
    'Security: Only valid platform roles (STUDENT, ORGANIZATION, ADMIN) are accepted',
    async () => {
      const invalidId =
        'c2eedc77-7a2b-2ef6-994b-4997ab160c33';

      await expect(
        usersService.createApplicationUser({
          id: invalidId,
          firstName: 'Hacker',
          lastName: 'User',
          role: 'SUPERADMIN' as any,
        }),
      ).rejects.toThrow();
    },
  );
});