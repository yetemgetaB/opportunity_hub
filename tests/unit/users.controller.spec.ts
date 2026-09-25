import { ForbiddenException } from '@nestjs/common';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../src/auth/auth.interface';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(() => {
    usersService = {
      getUserById: jest.fn(),
    } as any;

    controller = new UsersController(usersService);
  });

  const userA: AuthenticatedUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'userA@test.com',
    role: UserRole.STUDENT,
    isActive: true,
  };

  const userB: AuthenticatedUser = {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'userB@test.com',
    role: UserRole.ORGANIZATION,
    isActive: true,
  };

  const adminUser: AuthenticatedUser = {
    id: '00000000-0000-0000-0000-000000000099',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
    isActive: true,
  };

  it('should allow User A to retrieve User A record', async () => {
    const mockProfile = {
      id: userA.id,
      firstName: 'Abebe',
      lastName: 'Kebede',
      middleName: null,
      role: UserRole.STUDENT,
      avatarUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    usersService.getUserById.mockResolvedValueOnce(mockProfile);

    const result = await controller.getUserById(userA.id, userA);
    expect(result).toEqual(mockProfile);
    expect(usersService.getUserById).toHaveBeenCalledWith(userA.id);
  });

  it('should forbid User A from retrieving User B record (403 Forbidden)', async () => {
    await expect(controller.getUserById(userB.id, userA)).rejects.toThrow(
      new ForbiddenException('Forbidden: You are not authorized to access this user profile.'),
    );
    expect(usersService.getUserById).not.toHaveBeenCalled();
  });

  it('should allow ADMIN to retrieve User B record', async () => {
    const mockProfile = {
      id: userB.id,
      firstName: 'Almaz',
      lastName: 'Tesfaye',
      middleName: null,
      role: UserRole.ORGANIZATION,
      avatarUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    usersService.getUserById.mockResolvedValueOnce(mockProfile);

    const result = await controller.getUserById(userB.id, adminUser);
    expect(result).toEqual(mockProfile);
    expect(usersService.getUserById).toHaveBeenCalledWith(userB.id);
  });

  it('should verify that POST /users does NOT exist on the controller', () => {
    expect((controller as any).createUser).toBeUndefined();
  });
});
