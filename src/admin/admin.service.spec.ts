import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import { AdminService } from './admin.service';
import { UsersRepository } from '@/users/users.repository';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

describe('AdminService', () => {
  let service: AdminService;
  let mockUsersRepository: any;

  const mockAdminId = '123e4567-e89b-12d3-a456-426614174000';
  const mockStudentId = 'student-1234-5678-90ab-cdef12345678';

  const mockAdminUser = {
    id: mockAdminId,
    firstName: 'Super',
    middleName: null,
    lastName: 'Admin',
    role: UserRole.ADMIN,
    avatarUrl: 'https://example.com/avatar.png',
    isActive: true,
    createdAt: new Date('2026-09-20T10:00:00Z'),
    updatedAt: new Date('2026-10-06T20:00:00Z'),
    deletedAt: null,
  };

  const mockStudentUser = {
    ...mockAdminUser,
    id: mockStudentId,
    role: UserRole.STUDENT,
  };

  beforeEach(async () => {
    mockUsersRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return admin profile for active administrator', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockAdminUser);

      const result = await service.getProfile(mockAdminId);

      expect(result).toEqual({
        id: mockAdminUser.id,
        firstName: mockAdminUser.firstName,
        middleName: null,
        lastName: mockAdminUser.lastName,
        role: UserRole.ADMIN,
        avatarUrl: mockAdminUser.avatarUrl,
        isActive: true,
        createdAt: mockAdminUser.createdAt,
        updatedAt: mockAdminUser.updatedAt,
      });
      expect(mockUsersRepository.findById).toHaveBeenCalledWith(mockAdminId);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user is inactive', async () => {
      mockUsersRepository.findById.mockResolvedValue({
        ...mockAdminUser,
        isActive: false,
      });

      await expect(service.getProfile(mockAdminId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not an administrator', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockStudentUser);

      await expect(service.getProfile(mockStudentId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update permitted fields and return updated profile', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockAdminUser);
      const updateDto: UpdateAdminProfileDto = {
        firstName: 'Jane',
        middleName: 'M',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/new.png',
      };
      const updatedUser = {
        ...mockAdminUser,
        ...updateDto,
        updatedAt: new Date('2026-10-06T22:00:00Z'),
      };
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(mockAdminId, updateDto);

      expect(result.firstName).toBe('Jane');
      expect(result.middleName).toBe('M');
      expect(result.lastName).toBe('Doe');
      expect(result.avatarUrl).toBe('https://example.com/new.png');
      expect(result.role).toBe(UserRole.ADMIN);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(mockAdminId, {
        firstName: 'Jane',
        middleName: 'M',
        lastName: 'Doe',
        avatarUrl: 'https://example.com/new.png',
      });
    });

    it('should throw NotFoundException when trying to update non-existent user', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent-id', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockUsersRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when non-admin user attempts update', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockStudentUser);

      await expect(
        service.updateProfile(mockStudentId, { firstName: 'Test' }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockUsersRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating an inactive administrator', async () => {
      mockUsersRepository.findById.mockResolvedValue({
        ...mockAdminUser,
        isActive: false,
      });

      await expect(
        service.updateProfile(mockAdminId, { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockUsersRepository.update).not.toHaveBeenCalled();
    });

    it('should allow clearing nullable fields (middleName: null, avatarUrl: null)', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockAdminUser);
      const updateDto: UpdateAdminProfileDto = {
        middleName: null,
        avatarUrl: null,
      };
      const updatedUser = {
        ...mockAdminUser,
        middleName: null,
        avatarUrl: null,
      };
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile(mockAdminId, updateDto);

      expect(result.middleName).toBeNull();
      expect(result.avatarUrl).toBeNull();
      expect(result.role).toBe(UserRole.ADMIN);
      expect(mockUsersRepository.update).toHaveBeenCalledWith(mockAdminId, {
        firstName: undefined,
        middleName: null,
        lastName: undefined,
        avatarUrl: null,
      });
    });

    it('should ensure the returned profile role strictly remains ADMIN after update', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockAdminUser);
      mockUsersRepository.update.mockResolvedValue({
        ...mockAdminUser,
        firstName: 'UpdatedAdmin',
      });

      const result = await service.updateProfile(mockAdminId, {
        firstName: 'UpdatedAdmin',
      });

      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.firstName).toBe('UpdatedAdmin');
    });
  });
});
