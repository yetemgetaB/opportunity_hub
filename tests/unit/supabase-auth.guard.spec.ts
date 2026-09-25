import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseAuthGuard } from '../../src/auth/guards/supabase-auth.guard';
import { UsersRepository } from '../../src/users/users.repository';
import { UserRole } from '@prisma/client';

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;
  let configService: jest.Mocked<ConfigService>;
  let usersRepository: jest.Mocked<UsersRepository>;

  const mockGetUser = jest.fn();

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'database.supabaseUrl') return 'https://test.supabase.co';
        if (key === 'database.supabaseAnonKey') return 'test-anon-key';
        return undefined;
      }),
    } as any;

    usersRepository = {
      findById: jest.fn(),
    } as any;

    guard = new SupabaseAuthGuard(configService, usersRepository);
    (guard as any).supabase = {
      auth: {
        getUser: mockGetUser,
      },
    };
  });

  const createMockContext = (authHeader?: string) => {
    const request = {
      headers: {
        authorization: authHeader,
      },
      user: null,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const context = createMockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authorization header is required.'),
    );
  });

  it('should throw UnauthorizedException if header is not Bearer token', async () => {
    const context = createMockContext('Basic dXNlcjpwYXNz');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authorization header must use Bearer token.'),
    );
  });

  it('should throw UnauthorizedException if Supabase token is invalid or expired', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid JWT' },
    });

    const context = createMockContext('Bearer invalid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired access token.'),
    );
  });

  it('should throw UnauthorizedException if application user does not exist in public.users', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '00000000-0000-0000-0000-000000000001', email: 'test@example.com' } },
      error: null,
    });
    usersRepository.findById.mockResolvedValueOnce(null);

    const context = createMockContext('Bearer valid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('No application user profile found for authenticated identity.'),
    );
  });

  it('should throw UnauthorizedException if application user is deactivated', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '00000000-0000-0000-0000-000000000001', email: 'test@example.com' } },
      error: null,
    });
    usersRepository.findById.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      firstName: 'Inactive',
      lastName: 'User',
      middleName: null,
      role: UserRole.STUDENT,
      avatarUrl: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const context = createMockContext('Bearer valid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('User account is deactivated.'),
    );
  });

  it('should successfully attach authenticated user context to request for valid active user', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: '00000000-0000-0000-0000-000000000001', email: 'student@example.com' } },
      error: null,
    });
    usersRepository.findById.mockResolvedValueOnce({
      id: '00000000-0000-0000-0000-000000000001',
      firstName: 'Abebe',
      lastName: 'Kebede',
      middleName: null,
      role: UserRole.STUDENT,
      avatarUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const context = createMockContext('Bearer valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const req = context.switchToHttp().getRequest();
    expect(req.user).toEqual({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'student@example.com',
      role: UserRole.STUDENT,
      isActive: true,
    });
  });
});
