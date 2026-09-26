import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { RolesGuard } from '../../src/common/guards/roles.guard';
import { UsersService } from '../../src/users/users.service';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: any;
  let mockUsersService: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    mockUsersService = {
      getRoleByAuthId: jest.fn(),
    };

    guard = new RolesGuard(
      mockReflector as unknown as Reflector,
      mockUsersService as unknown as UsersService,
    );
  });

  const createContext = (user?: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access when no roles are required', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);

    const result = await guard.canActivate(createContext());

    expect(result).toBe(true);
  });

  it('should reject unauthenticated requests', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
    ]);

    await expect(
      guard.canActivate(createContext()),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should allow a user with the required role', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
    ]);

    mockUsersService.getRoleByAuthId.mockResolvedValue({
      id: 'admin-123',
      role: UserRole.ADMIN,
      isActive: true,
      isDeleted: false,
    });

    const result = await guard.canActivate(
      createContext({
        id: 'admin-123',
      }),
    );

    expect(result).toBe(true);
  });

  it('should allow a STUDENT when STUDENT is required', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      UserRole.STUDENT,
    ]);

    mockUsersService.getRoleByAuthId.mockResolvedValue({
      id: 'student-123',
      role: UserRole.STUDENT,
      isActive: true,
      isDeleted: false,
    });

    const result = await guard.canActivate(
      createContext({
        id: 'student-123',
      }),
    );

    expect(result).toBe(true);
  });

  it('should allow an ORGANIZATION when ORGANIZATION is required', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      UserRole.ORGANIZATION,
    ]);

    mockUsersService.getRoleByAuthId.mockResolvedValue({
      id: 'organization-123',
      role: UserRole.ORGANIZATION,
      isActive: true,
      isDeleted: false,
    });

    const result = await guard.canActivate(
      createContext({
        id: 'organization-123',
      }),
    );

    expect(result).toBe(true);
  });

  it('should reject a user with the wrong role', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
    ]);

    mockUsersService.getRoleByAuthId.mockResolvedValue({
      id: 'student-123',
      role: UserRole.STUDENT,
      isActive: true,
      isDeleted: false,
    });

    await expect(
      guard.canActivate(
        createContext({
          id: 'student-123',
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should reject an inactive user', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
    ]);

    mockUsersService.getRoleByAuthId.mockResolvedValue({
      id: 'admin-123',
      role: UserRole.ADMIN,
      isActive: false,
      isDeleted: false,
    });

    await expect(
      guard.canActivate(
        createContext({
          id: 'admin-123',
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should reject a deleted user', async () => {
    mockReflector.getAllAndOverride.mockReturnValue([
      UserRole.ADMIN,
    ]);

    mockUsersService.getRoleByAuthId.mockResolvedValue({
      id: 'admin-123',
      role: UserRole.ADMIN,
      isActive: true,
      isDeleted: true,
    });

    await expect(
      guard.canActivate(
        createContext({
          id: 'admin-123',
        }),
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});