import { UsersRepository } from '../../src/users/users.repository';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new UsersRepository(mockPrisma as unknown as PrismaService);
  });

  describe('findById', () => {
    it('should return user when active and exists', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Alex',
        middleName: null,
        lastName: 'Smith',
        role: UserRole.STUDENT,
        avatarUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById(mockUser.id);
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return null when user is soft-deleted and includeDeleted is false', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Alex',
        middleName: null,
        lastName: 'Smith',
        role: UserRole.STUDENT,
        avatarUrl: null,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findById(mockUser.id, false);
      expect(result).toBeNull();
    });
  });

  describe('findRoleByAuthId', () => {
    it('should return user role and active status', async () => {
      const authId = '123e4567-e89b-12d3-a456-426614174000';
      mockPrisma.user.findUnique.mockResolvedValue({
        id: authId,
        role: UserRole.ORGANIZATION,
        isActive: true,
        deletedAt: null,
      });

      const result = await repository.findRoleByAuthId(authId);
      expect(result).toEqual({
        id: authId,
        role: UserRole.ORGANIZATION,
        isActive: true,
        isDeleted: false,
      });
    });

    it('should return null if auth user has no public.users record', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await repository.findRoleByAuthId('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should persist application user mapped to Supabase Auth ID', async () => {
      const createData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'Jordan',
        lastName: 'Lee',
        role: UserRole.STUDENT,
      };

      const createdUser = {
        ...createData,
        middleName: null,
        avatarUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrisma.user.create.mockResolvedValue(createdUser);

      const result = await repository.create(createData);
      expect(result).toEqual(createdUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          id: createData.id,
          firstName: 'Jordan',
          middleName: null,
          lastName: 'Lee',
          role: UserRole.STUDENT,
          avatarUrl: null,
          isActive: true,
        },
      });
    });

    it('should throw ConflictException on duplicate primary key P2002 error', async () => {
      mockPrisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        repository.create({
          id: 'duplicate-id',
          firstName: 'Test',
          lastName: 'User',
          role: UserRole.ADMIN,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
