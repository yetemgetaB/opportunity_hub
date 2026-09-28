import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { PublicRegisterRole } from '../../src/auth/dto/register.dto';

describe('AuthService Hardening & Rollback', () => {
  let authService: AuthService;
  let configService: jest.Mocked<ConfigService>;
  let usersService: jest.Mocked<UsersService>;

  const mockSignUp = jest.fn();
  const mockDeleteUser = jest.fn();

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        if (key === 'database.supabaseUrl') return 'https://test.supabase.co';
        if (key === 'database.supabaseAnonKey') return 'test-anon-key';
        if (key === 'database.supabaseServiceRoleKey') return 'test-service-role-key';
        return undefined;
      }),
    } as any;

    usersService = {
      createApplicationUser: jest.fn(),
      getUserById: jest.fn(),
    } as any;

    authService = new AuthService(configService, usersService);

    // Inject mock clients
    (authService as any).supabaseClient = {
      auth: {
        signUp: mockSignUp,
      },
    };
    (authService as any).supabaseAdminClient = {
      auth: {
        admin: {
          deleteUser: mockDeleteUser,
        },
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register with compensating rollback', () => {
    const registerDto = {
      email: 'student@example.com',
      password: 'Password123!',
      firstName: 'Abebe',
      lastName: 'Kebede',
      role: PublicRegisterRole.STUDENT,
    };

    it('should complete registration successfully when Supabase and DB create succeed', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: 'auth-user-123', email: 'student@example.com' },
          session: { access_token: 'valid.token' },
        },
        error: null,
      });

      const mockCreatedUser = {
        id: 'auth-user-123',
        firstName: 'Abebe',
        lastName: 'Kebede',
        middleName: null,
        role: UserRole.STUDENT,
        avatarUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      usersService.createApplicationUser.mockResolvedValueOnce(mockCreatedUser);

      const result = await authService.register(registerDto);

      expect(mockSignUp).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
      });
      expect(usersService.createApplicationUser).toHaveBeenCalledWith({
        id: 'auth-user-123',
        firstName: registerDto.firstName,
        middleName: undefined,
        lastName: registerDto.lastName,
        role: UserRole.STUDENT,
      });
      expect(result.user).toEqual(mockCreatedUser);
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    it('should trigger compensating deleteUser rollback when DB user creation fails', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: 'auth-user-123', email: 'student@example.com' },
          session: null,
        },
        error: null,
      });

      const dbError = new BadRequestException('Database constraint violation');
      usersService.createApplicationUser.mockRejectedValueOnce(dbError);
      mockDeleteUser.mockResolvedValueOnce({ data: {}, error: null });

      await expect(authService.register(registerDto)).rejects.toThrow(dbError);

      expect(mockDeleteUser).toHaveBeenCalledWith('auth-user-123');
    });

    it('should preserve and rethrow original application error even if rollback deleteUser fails', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: 'auth-user-123', email: 'student@example.com' },
          session: null,
        },
        error: null,
      });

      const dbError = new BadRequestException('Database connection failed');
      usersService.createApplicationUser.mockRejectedValueOnce(dbError);
      mockDeleteUser.mockResolvedValueOnce({
        data: null,
        error: { message: 'Network error deleting user' },
      });

      await expect(authService.register(registerDto)).rejects.toThrow(dbError);

      expect(mockDeleteUser).toHaveBeenCalledWith('auth-user-123');
    });
  });
});
