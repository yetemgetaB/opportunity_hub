import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { StudentProfileController } from './student-profile.controller';
import { StudentProfileService } from './student-profile.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';

describe('StudentProfileController', () => {
  let controller: StudentProfileController;
  let service: StudentProfileService;
  let reflector: Reflector;

  const mockService = {
    getMyProfile: jest.fn(),
    createMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentProfileController],
      providers: [
        {
          provide: StudentProfileService,
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

    controller = module.get<StudentProfileController>(StudentProfileController);
    service = module.get<StudentProfileService>(StudentProfileService);
    reflector = module.get<Reflector>(Reflector);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have Roles metadata set to [STUDENT]', () => {
    const roles = reflector.get<UserRole[]>(ROLES_KEY, StudentProfileController);
    expect(roles).toEqual([UserRole.STUDENT]);
  });

  it('should call service.getMyProfile with authenticated userId', async () => {
    const userId = '11111111-1111-1111-1111-111111111111';
    const mockProfile = { userId, university: 'AAU', fieldOfStudy: 'CS', academicYear: 3 };
    mockService.getMyProfile.mockResolvedValue(mockProfile);

    const result = await controller.getMyProfile(userId);
    expect(service.getMyProfile).toHaveBeenCalledWith(userId);
    expect(result).toEqual(mockProfile);
  });

  it('should call service.createMyProfile with authenticated userId and DTO', async () => {
    const userId = '11111111-1111-1111-1111-111111111111';
    const dto = {
      academicYear: 4,
      university: 'Addis Ababa University',
      fieldOfStudy: 'Software Engineering',
      location: 'Addis Ababa',
    };
    const mockCreated = { userId, ...dto };
    mockService.createMyProfile.mockResolvedValue(mockCreated);

    const result = await controller.createMyProfile(userId, dto);
    expect(service.createMyProfile).toHaveBeenCalledWith(userId, dto);
    expect(result).toEqual(mockCreated);
  });

  it('should call service.updateMyProfile with authenticated userId and DTO', async () => {
    const userId = '11111111-1111-1111-1111-111111111111';
    const dto = {
      academicYear: 5,
      careerGoals: 'Full Stack Engineer',
    };
    const mockUpdated = { userId, academicYear: 5, careerGoals: 'Full Stack Engineer' };
    mockService.updateMyProfile.mockResolvedValue(mockUpdated);

    const result = await controller.updateMyProfile(userId, dto);
    expect(service.updateMyProfile).toHaveBeenCalledWith(userId, dto);
    expect(result).toEqual(mockUpdated);
  });
});
