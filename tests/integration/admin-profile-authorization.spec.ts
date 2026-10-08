import { ExecutionContext, ForbiddenException, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { RolesGuard } from '../../src/common/guards/roles.guard';
import { UsersService } from '../../src/users/users.service';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminService } from '../../src/admin/admin.service';
import { UpdateAdminProfileDto } from '../../src/admin/dto/update-admin-profile.dto';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Admin Profile Role Authorization & Validation Security Suite', () => {
  let rolesGuard: RolesGuard;
  let mockUsersService: any;
  let mockAdminService: any;

  beforeAll(async () => {
    mockUsersService = {
      getRoleByAuthId: jest.fn(),
    };
    mockAdminService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
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
        {
          provide: AdminService,
          useValue: mockAdminService,
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

  describe('AdminController Role Matrix', () => {
    describe('GET /admin/profile (getProfile)', () => {
      it('ADMIN role is allowed access to get admin profile', async () => {
        const authId = 'admin-auth-id';

        mockUsersService.getRoleByAuthId.mockResolvedValue({
          id: authId,
          role: UserRole.ADMIN,
          isActive: true,
          isDeleted: false,
        });

        const context = createMockExecutionContext(
          { id: authId },
          AdminController,
          AdminController.prototype.getProfile,
        );

        const result = await rolesGuard.canActivate(context);
        expect(result).toBe(true);
      });

      it('STUDENT role is rejected with 403 Forbidden for get admin profile', async () => {
        const authId = 'student-auth-id';

        mockUsersService.getRoleByAuthId.mockResolvedValue({
          id: authId,
          role: UserRole.STUDENT,
          isActive: true,
          isDeleted: false,
        });

        const context = createMockExecutionContext(
          { id: authId },
          AdminController,
          AdminController.prototype.getProfile,
        );

        await expect(rolesGuard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );
      });

      it('ORGANIZATION role is rejected with 403 Forbidden for get admin profile', async () => {
        const authId = 'org-auth-id';

        mockUsersService.getRoleByAuthId.mockResolvedValue({
          id: authId,
          role: UserRole.ORGANIZATION,
          isActive: true,
          isDeleted: false,
        });

        const context = createMockExecutionContext(
          { id: authId },
          AdminController,
          AdminController.prototype.getProfile,
        );

        await expect(rolesGuard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );
      });

      it('Unauthenticated request (missing user) is rejected with 401 Unauthorized for get admin profile', async () => {
        const context = createMockExecutionContext(
          undefined,
          AdminController,
          AdminController.prototype.getProfile,
        );

        await expect(rolesGuard.canActivate(context)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });

    describe('PATCH /admin/profile (updateProfile)', () => {
      it('ADMIN role is allowed access to update admin profile', async () => {
        const authId = 'admin-auth-id';

        mockUsersService.getRoleByAuthId.mockResolvedValue({
          id: authId,
          role: UserRole.ADMIN,
          isActive: true,
          isDeleted: false,
        });

        const context = createMockExecutionContext(
          { id: authId },
          AdminController,
          AdminController.prototype.updateProfile,
        );

        const result = await rolesGuard.canActivate(context);
        expect(result).toBe(true);
      });

      it('STUDENT role is rejected with 403 Forbidden for update admin profile', async () => {
        const authId = 'student-auth-id';

        mockUsersService.getRoleByAuthId.mockResolvedValue({
          id: authId,
          role: UserRole.STUDENT,
          isActive: true,
          isDeleted: false,
        });

        const context = createMockExecutionContext(
          { id: authId },
          AdminController,
          AdminController.prototype.updateProfile,
        );

        await expect(rolesGuard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );
      });

      it('ORGANIZATION role is rejected with 403 Forbidden for update admin profile', async () => {
        const authId = 'org-auth-id';

        mockUsersService.getRoleByAuthId.mockResolvedValue({
          id: authId,
          role: UserRole.ORGANIZATION,
          isActive: true,
          isDeleted: false,
        });

        const context = createMockExecutionContext(
          { id: authId },
          AdminController,
          AdminController.prototype.updateProfile,
        );

        await expect(rolesGuard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );
      });

      it('Unauthenticated request (missing user) is rejected with 401 Unauthorized for update admin profile', async () => {
        const context = createMockExecutionContext(
          undefined,
          AdminController,
          AdminController.prototype.updateProfile,
        );

        await expect(rolesGuard.canActivate(context)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });

    describe('Inactive / Deleted Admin User Handling', () => {
      it('Inactive ADMIN is rejected with 403 Forbidden', async () => {
        const authId = 'inactive-admin-id';

        mockUsersService.getRoleByAuthId.mockResolvedValue({
          id: authId,
          role: UserRole.ADMIN,
          isActive: false,
          isDeleted: false,
        });

        const context = createMockExecutionContext(
          { id: authId },
          AdminController,
          AdminController.prototype.getProfile,
        );

        await expect(rolesGuard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );
      });

      it('Deleted ADMIN is rejected with 403 Forbidden', async () => {
        const authId = 'deleted-admin-id';

        mockUsersService.getRoleByAuthId.mockResolvedValue({
          id: authId,
          role: UserRole.ADMIN,
          isActive: true,
          isDeleted: true,
        });

        const context = createMockExecutionContext(
          { id: authId },
          AdminController,
          AdminController.prototype.getProfile,
        );

        await expect(rolesGuard.canActivate(context)).rejects.toThrow(
          ForbiddenException,
        );
      });
    });
  });

  describe('DTO Validation Security for UpdateAdminProfileDto', () => {
    it('Valid full payload passes validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        firstName: 'System',
        middleName: 'Admin',
        lastName: 'Manager',
        avatarUrl: 'https://example.com/avatar.png',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('Valid partial payload passes validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        firstName: 'System',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('Nullable fields (middleName: null, avatarUrl: null) pass validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        middleName: null,
        avatarUrl: null,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('Invalid avatarUrl format fails validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        avatarUrl: 'not-a-valid-url',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('avatarUrl');
    });

    it('Non-string firstName fails validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        firstName: 12345 as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
      expect(errors[0].property).toBe('firstName');
    });

    it('Non-whitelisted privilege escalation fields (role, id, isActive, email) rejected by ValidationPipe', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      const maliciousPayload = {
        firstName: 'ValidName',
        role: 'SUPERADMIN',
        isActive: false,
        email: 'hacker@example.com',
      };

      await expect(
        pipe.transform(maliciousPayload, {
          type: 'body',
          metatype: UpdateAdminProfileDto,
        }),
      ).rejects.toThrow();
    });

    it('Empty firstName fails validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        firstName: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].property).toBe('firstName');
    });

    it('Whitespace-only firstName fails validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        firstName: '   ',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].property).toBe('firstName');
    });

    it('Null firstName fails validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        firstName: null,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].property).toBe('firstName');
    });

    it('Empty lastName fails validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        lastName: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].property).toBe('lastName');
    });

    it('Whitespace-only lastName fails validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        lastName: '   ',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].property).toBe('lastName');
    });

    it('Null lastName fails validation', async () => {
      const dto = plainToInstance(UpdateAdminProfileDto, {
        lastName: null,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors[0].property).toBe('lastName');
    });

    it('Foreign userId field (cross-user attack) rejected by ValidationPipe', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      const maliciousPayload = {
        userId: 'foreign-admin-user-id',
        firstName: 'Attacker',
      };

      await expect(
        pipe.transform(maliciousPayload, {
          type: 'body',
          metatype: UpdateAdminProfileDto,
        }),
      ).rejects.toThrow();
    });

    it('Arbitrary id field in payload rejected by ValidationPipe', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      const maliciousPayload = {
        id: 'foreign-admin-user-id',
        firstName: 'Attacker',
      };

      await expect(
        pipe.transform(maliciousPayload, {
          type: 'body',
          metatype: UpdateAdminProfileDto,
        }),
      ).rejects.toThrow();
    });

    it('Role modification attempts (STUDENT, ORGANIZATION, ADMIN) rejected by ValidationPipe', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      for (const attemptRole of ['STUDENT', 'ORGANIZATION', 'ADMIN']) {
        await expect(
          pipe.transform(
            { role: attemptRole },
            {
              type: 'body',
              metatype: UpdateAdminProfileDto,
            },
          ),
        ).rejects.toThrow();
      }
    });

    it('Protected account fields (isActive, deletedAt, createdAt, updatedAt) rejected by ValidationPipe', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      const maliciousPayload = {
        isActive: false,
        deletedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await expect(
        pipe.transform(maliciousPayload, {
          type: 'body',
          metatype: UpdateAdminProfileDto,
        }),
      ).rejects.toThrow();
    });

    it('Authentication-owned fields (email, password) rejected by ValidationPipe', async () => {
      const pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      });

      await expect(
        pipe.transform(
          { email: 'newemail@example.com' },
          {
            type: 'body',
            metatype: UpdateAdminProfileDto,
          },
        ),
      ).rejects.toThrow();

      await expect(
        pipe.transform(
          { password: 'NewSecretPassword123!' },
          {
            type: 'body',
            metatype: UpdateAdminProfileDto,
          },
        ),
      ).rejects.toThrow();
    });
  });
});
