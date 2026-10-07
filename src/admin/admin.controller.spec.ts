import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AdminProfileResponseDto } from './dto/admin-profile-response.dto';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';

describe('AdminController', () => {
  let controller: AdminController;
  let mockAdminService: any;

  const mockAdminId = '123e4567-e89b-12d3-a456-426614174000';

  const mockProfile: AdminProfileResponseDto = {
    id: mockAdminId,
    firstName: 'Super',
    middleName: null,
    lastName: 'Admin',
    role: UserRole.ADMIN,
    avatarUrl: 'https://example.com/avatar.png',
    isActive: true,
    createdAt: new Date('2026-09-20T10:00:00Z'),
    updatedAt: new Date('2026-10-06T20:00:00Z'),
  };

  beforeEach(async () => {
    mockAdminService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should delegate to AdminService.getProfile with authenticated user ID', async () => {
      mockAdminService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockAdminId);

      expect(result).toEqual(mockProfile);
      expect(mockAdminService.getProfile).toHaveBeenCalledWith(mockAdminId);
    });
  });

  describe('updateProfile', () => {
    it('should delegate to AdminService.updateProfile with authenticated user ID and DTO', async () => {
      const updateDto: UpdateAdminProfileDto = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        avatarUrl: 'https://example.com/new.png',
      };
      const updatedProfile = { ...mockProfile, ...updateDto };
      mockAdminService.updateProfile.mockResolvedValue(updatedProfile);

      const result = await controller.updateProfile(mockAdminId, updateDto);

      expect(result).toEqual(updatedProfile);
      expect(mockAdminService.updateProfile).toHaveBeenCalledWith(
        mockAdminId,
        updateDto,
      );
    });
  });

  describe('stub endpoints', () => {
    it('should return protected message for users endpoint', () => {
      expect(controller.getUsers()).toEqual({
        message: 'Admin users endpoint is protected.',
        role: UserRole.ADMIN,
      });
    });

    it('should return protected message for organizations endpoint', () => {
      expect(controller.getOrganizations()).toEqual({
        message: 'Admin organizations endpoint is protected.',
        role: UserRole.ADMIN,
      });
    });

    it('should return protected message for opportunities endpoint', () => {
      expect(controller.getOpportunities()).toEqual({
        message: 'Admin opportunities endpoint is protected.',
        role: UserRole.ADMIN,
      });
    });

    it('should return protected message for reports endpoint', () => {
      expect(controller.getReports()).toEqual({
        message: 'Admin reports endpoint is protected.',
        role: UserRole.ADMIN,
      });
    });
  });
});