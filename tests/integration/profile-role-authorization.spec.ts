import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RolesGuard } from '../../src/common/guards/roles.guard';
import { UsersService } from '../../src/users/users.service';
import { StudentProfileController } from '../../src/student-profile/student-profile.controller';
import { OrganizationProfileController } from '../../src/organization-profile/organization-profile.controller';
import { CreateStudentProfileDto } from '../../src/student-profile/dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from '../../src/student-profile/dto/update-student-profile.dto';
import { UpdateOrganizationProfileDto } from '../../src/organization-profile/dto/update-organization-profile.dto';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Profile Role Authorization & Validation Security Suite', () => {
  let rolesGuard: RolesGuard;
  let mockUsersService: any;

  beforeAll(async () => {
    mockUsersService = {
      getRoleByAuthId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        Reflector,
        PrismaService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    user: any,
    targetController: any,
    targetHandler: (...args: any[]) => any,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getClass: () => targetController,
      getHandler: () => targetHandler,
    } as unknown as ExecutionContext;
  };

  describe('StudentProfileController Role Matrix', () => {
    it('STUDENT role is allowed access to student profile', async () => {
      const authId = 'student-auth-id';

      mockUsersService.getRoleByAuthId.mockResolvedValue({
        id: authId,
        role: UserRole.STUDENT,
        isActive: true,
        isDeleted: false,
      });

      const context = createMockExecutionContext(
        { id: authId },
        StudentProfileController,
        StudentProfileController.prototype.getMyProfile,
      );

      const result = await rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('ORGANIZATION role is rejected with 403 Forbidden for student profile', async () => {
      const authId = 'org-auth-id';

      mockUsersService.getRoleByAuthId.mockResolvedValue({
        id: authId,
        role: UserRole.ORGANIZATION,
        isActive: true,
        isDeleted: false,
      });

      const context = createMockExecutionContext(
        { id: authId },
        StudentProfileController,
        StudentProfileController.prototype.getMyProfile,
      );

      await expect(
        rolesGuard.canActivate(context),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ADMIN role is rejected with 403 Forbidden for student profile', async () => {
      const authId = 'admin-auth-id';

      mockUsersService.getRoleByAuthId.mockResolvedValue({
        id: authId,
        role: UserRole.ADMIN,
        isActive: true,
        isDeleted: false,
      });

      const context = createMockExecutionContext(
        { id: authId },
        StudentProfileController,
        StudentProfileController.prototype.getMyProfile,
      );

      await expect(
        rolesGuard.canActivate(context),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('OrganizationProfileController Role Matrix', () => {
    it('ORGANIZATION role is allowed access to organization profile', async () => {
      const authId = 'org-auth-id';

      mockUsersService.getRoleByAuthId.mockResolvedValue({
        id: authId,
        role: UserRole.ORGANIZATION,
        isActive: true,
        isDeleted: false,
      });

      const context = createMockExecutionContext(
        { id: authId },
        OrganizationProfileController,
        OrganizationProfileController.prototype.getMyProfile,
      );

      const result = await rolesGuard.canActivate(context);

      expect(result).toBe(true);
    });

    it('STUDENT role is rejected with 403 Forbidden for organization profile', async () => {
      const authId = 'student-auth-id';

      mockUsersService.getRoleByAuthId.mockResolvedValue({
        id: authId,
        role: UserRole.STUDENT,
        isActive: true,
        isDeleted: false,
      });

      const context = createMockExecutionContext(
        { id: authId },
        OrganizationProfileController,
        OrganizationProfileController.prototype.getMyProfile,
      );

      await expect(
        rolesGuard.canActivate(context),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ADMIN role is rejected with 403 Forbidden for organization profile', async () => {
      const authId = 'admin-auth-id';

      mockUsersService.getRoleByAuthId.mockResolvedValue({
        id: authId,
        role: UserRole.ADMIN,
        isActive: true,
        isDeleted: false,
      });

      const context = createMockExecutionContext(
        { id: authId },
        OrganizationProfileController,
        OrganizationProfileController.prototype.getMyProfile,
      );

      await expect(
        rolesGuard.canActivate(context),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Inactive / Deleted User Handling', () => {
    it('Inactive STUDENT is rejected with 403 Forbidden', async () => {
      const authId = 'inactive-student-id';

      mockUsersService.getRoleByAuthId.mockResolvedValue({
        id: authId,
        role: UserRole.STUDENT,
        isActive: false,
        isDeleted: false,
      });

      const context = createMockExecutionContext(
        { id: authId },
        StudentProfileController,
        StudentProfileController.prototype.getMyProfile,
      );

      await expect(
        rolesGuard.canActivate(context),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Deleted ORGANIZATION user is rejected with 403 Forbidden', async () => {
      const authId = 'deleted-org-id';

      mockUsersService.getRoleByAuthId.mockResolvedValue({
        id: authId,
        role: UserRole.ORGANIZATION,
        isActive: true,
        isDeleted: true,
      });

      const context = createMockExecutionContext(
        { id: authId },
        OrganizationProfileController,
        OrganizationProfileController.prototype.getMyProfile,
      );

      await expect(
        rolesGuard.canActivate(context),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DTO Validation Security', () => {
    it('CreateStudentProfileDto: Valid payload passes validation', async () => {
      const dto = plainToInstance(CreateStudentProfileDto, {
        academicYear: 3,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals: 'AI Engineer',
        careerGoalTags: ['AI', 'Python'],
        interests: ['Machine Learning'],
        isDiscoverable: true,
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('CreateStudentProfileDto: Missing required fields fail validation', async () => {
      const dto = plainToInstance(CreateStudentProfileDto, {
        location: 'Addis Ababa',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(3);

      const errorProps = errors.map((e) => e.property);

      expect(errorProps).toContain('academicYear');
      expect(errorProps).toContain('university');
      expect(errorProps).toContain('fieldOfStudy');
    });

    it('CreateStudentProfileDto: Invalid academicYear (<1) fails validation', async () => {
      const dto = plainToInstance(CreateStudentProfileDto, {
        academicYear: 0,
        university: 'AAU',
        fieldOfStudy: 'CS',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('academicYear');
    });

    it('UpdateStudentProfileDto: Valid partial update passes validation', async () => {
      const dto = plainToInstance(UpdateStudentProfileDto, {
        academicYear: 4,
        careerGoals: 'Senior Engineer',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('UpdateOrganizationProfileDto: Valid fields pass validation', async () => {
      const dto = plainToInstance(UpdateOrganizationProfileDto, {
        name: 'Tech Innovators PLC',
        description: 'Building software in Ethiopia',
        websiteUrl: 'https://techinnovators.et',
        contactEmail: 'info@techinnovators.et',
        contactPhone: '+251911223344',
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('UpdateOrganizationProfileDto: Non-whitelisted verificationStatus rejected by global ValidationPipe', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      const maliciousPayload = {
        name: 'Valid Name',
        verificationStatus: 'APPROVED',
      };

      await expect(
        pipe.transform(maliciousPayload, {
          type: 'body',
          metatype: UpdateOrganizationProfileDto,
        }),
      ).rejects.toThrow();
    });
  });
});