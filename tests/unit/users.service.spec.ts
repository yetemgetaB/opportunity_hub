import { UsersService } from '../../src/users/users.service';
import { UsersRepository } from '../../src/users/users.repository';
import { UserRole } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findRoleByAuthId: jest.fn(),
      create: jest.fn(),
      existsAndActive: jest.fn(),
    };
    service = new UsersService(mockRepository as unknown as UsersRepository);
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = {
        id: 'user-123',
        firstName: 'Jane',
        middleName: null,
        lastName: 'Doe',
        role: UserRole.STUDENT,
        avatarUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockRepository.findById.mockResolvedValue(user);

      const result = await service.getUserById('user-123');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.getUserById('missing-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRoleByAuthId', () => {
    it('should return user role for authenticated ID', async () => {
      const authId = 'auth-uid-123';
      mockRepository.findRoleByAuthId.mockResolvedValue({
        id: authId,
        role: UserRole.ADMIN,
        isActive: true,
        isDeleted: false,
      });

      const result = await service.getRoleByAuthId(authId);
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.id).toBe(authId);
    });

    it('should throw BadRequestException if auth ID is empty', async () => {
      await expect(service.getRoleByAuthId('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user record does not exist', async () => {
      mockRepository.findRoleByAuthId.mockResolvedValue(null);
      await expect(service.getRoleByAuthId('unregistered-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createApplicationUser', () => {
    it('should validate inputs and create user record', async () => {
      const createData = {
        id: 'new-auth-id',
        firstName: 'Sam',
        lastName: 'Taylor',
        role: UserRole.ORGANIZATION,
      };
      mockRepository.create.mockResolvedValue({
        ...createData,
        middleName: null,
        avatarUrl: null,
        isActive: true,
      });

      const result = await service.createApplicationUser(createData);
      expect(result.role).toBe(UserRole.ORGANIZATION);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });

    it('should reject creation without auth user ID', async () => {
      await expect(
        service.createApplicationUser({
          id: '',
          firstName: 'Sam',
          lastName: 'Taylor',
          role: UserRole.STUDENT,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject creation with invalid role enum', async () => {
      await expect(
        service.createApplicationUser({
          id: 'valid-id',
          firstName: 'Sam',
          lastName: 'Taylor',
          role: 'SUPER_USER' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
