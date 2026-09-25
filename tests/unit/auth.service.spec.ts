import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { PublicRegisterRole } from '../../src/auth/dto/register.dto';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let configService: jest.Mocked<ConfigService>;
  let usersService: jest.Mocked<UsersService>;

  const mockSignUp = jest.fn();
  const mockSignInWithPassword = jest.fn();
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

    service = new AuthService(configService, usersService);

    // Mock internal clients
    (service as any).supabaseClient = {
      auth: {
        signUp: mockSignUp,
        signInWithPassword: mockSignInWithPassword,
      },
    };

    (service as any).supabaseAdminClient = {
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

  describe('register', () => {
    const studentRegisterData = {
      email: 'student@test.com',
      password: 'Password123!',
      firstName: 'Abebe',
      lastName: 'Kebede',
      role: PublicRegisterRole.STUDENT,
    };

    const orgRegisterData = {
      email: 'org@test.com',
      password: 'Password123!',
      firstName: 'Almaz',
      lastName: 'Tesfaye',
      role: PublicRegisterRole.ORGANIZATION,
    };

    it('should successfully register a STUDENT user', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: '00000000-0000-0000-0000-000000000001', email: 'student@test.com' },
          session: { access_token: 'mock-token' },
        },
        error: null,
      });

      const mockCreatedUser = {
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
      };
      usersService.createApplicationUser.mockResolvedValueOnce(mockCreatedUser);

      const result = await service.register(studentRegisterData);

      expect(result.user).toEqual(mockCreatedUser);
      expect(result.session).toBeDefined();
      expect(mockSignUp).toHaveBeenCalledWith({
        email: studentRegisterData.email,
        password: studentRegisterData.password,
      });
      expect(usersService.createApplicationUser).toHaveBeenCalledWith({
        id: '00000000-0000-0000-0000-000000000001',
        firstName: 'Abebe',
        middleName: undefined,
        lastName: 'Kebede',
        role: UserRole.STUDENT,
      });
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    it('should successfully register an ORGANIZATION user', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: '00000000-0000-0000-0000-000000000002', email: 'org@test.com' },
          session: { access_token: 'mock-token-2' },
        },
        error: null,
      });

      const mockCreatedUser = {
        id: '00000000-0000-0000-0000-000000000002',
        firstName: 'Almaz',
        lastName: 'Tesfaye',
        middleName: null,
        role: UserRole.ORGANIZATION,
        avatarUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      usersService.createApplicationUser.mockResolvedValueOnce(mockCreatedUser);

      const result = await service.register(orgRegisterData);

      expect(result.user.role).toBe(UserRole.ORGANIZATION);
      expect(mockDeleteUser).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already registered in Supabase Auth', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      await expect(service.register(studentRegisterData)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.createApplicationUser).not.toHaveBeenCalled();
    });

    it('should perform compensating deletion of Auth user if createApplicationUser fails', async () => {
      const authUserId = '00000000-0000-0000-0000-000000000099';
      mockSignUp.mockResolvedValueOnce({
        data: {
          user: { id: authUserId, email: 'student@test.com' },
          session: null,
        },
        error: null,
      });

      mockDeleteUser.mockResolvedValueOnce({ error: null });

      const dbError = new BadRequestException('Database constraint error');
      usersService.createApplicationUser.mockRejectedValueOnce(dbError);

      await expect(service.register(studentRegisterData)).rejects.toThrow(dbError);

      // Verify that compensating deletion was triggered
      expect(mockDeleteUser).toHaveBeenCalledWith(authUserId);
    });
  });

  describe('login', () => {
    it('should authenticate user and return user profile with session', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: '00000000-0000-0000-0000-000000000001' },
          session: { access_token: 'access-token' },
        },
        error: null,
      });

      const mockUser = {
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
      };
      usersService.getUserById.mockResolvedValueOnce(mockUser);

      const result = await service.login({
        email: 'student@test.com',
        password: 'Password123!',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.session).toBeDefined();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        service.login({ email: 'student@test.com', password: 'WrongPassword' }),
      ).rejects.toThrow(new UnauthorizedException('Invalid email or password.'));
    });
  });
});
