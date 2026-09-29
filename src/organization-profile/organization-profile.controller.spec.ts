import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { OrganizationProfileController } from './organization-profile.controller';
import { OrganizationProfileService } from './organization-profile.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';

describe('OrganizationProfileController', () => {
  let controller: OrganizationProfileController;
  let service: OrganizationProfileService;
  let reflector: Reflector;

  const mockService = {
    getMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationProfileController],
      providers: [
        {
          provide: OrganizationProfileService,
          useValue: mockService,
        },
        Reflector,
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OrganizationProfileController>(
      OrganizationProfileController,
    );
    service = module.get<OrganizationProfileService>(
      OrganizationProfileService,
    );
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have Roles metadata set to [ORGANIZATION]', () => {
    const roles = reflector.get<UserRole[]>(
      ROLES_KEY,
      OrganizationProfileController,
    );
    expect(roles).toEqual([UserRole.ORGANIZATION]);
  });

  it('should call service.getMyProfile with authenticated userId', async () => {
    const userId = '22222222-2222-2222-2222-222222222222';
    const mockOrg = {
      id: 'org-123',
      name: 'Acme Corp',
      description: 'Tech Company',
      websiteUrl: 'https://acme.example.com',
    };
    mockService.getMyProfile.mockResolvedValue(mockOrg);

    const result = await controller.getMyProfile(userId);
    expect(service.getMyProfile).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockOrg);
  });

  it('should call service.updateMyProfile with authenticated userId and DTO', async () => {
    const userId = '22222222-2222-2222-2222-222222222222';
    const dto = {
      description: 'Updated Tech Corp',
      contactPhone: '+251911000000',
    };
    const mockUpdatedOrg = {
      id: 'org-123',
      name: 'Acme Corp',
      description: 'Updated Tech Corp',
      contactPhone: '+251911000000',
    };
    mockService.updateMyProfile.mockResolvedValue(mockUpdatedOrg);

    const result = await controller.updateMyProfile(userId, dto);
    expect(service.updateMyProfile).toHaveBeenCalledWith(userId, dto);
    expect(result).toEqual(mockUpdatedOrg);
  });
});
