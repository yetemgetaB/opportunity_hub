import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { RegisterDto, PublicRegisterRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabaseClient: SupabaseClient | null = null;
  private supabaseAdminClient: SupabaseClient | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private getSupabaseClient(): SupabaseClient {
    if (this.supabaseClient) {
      return this.supabaseClient;
    }

    const supabaseUrl = this.configService.get<string>('database.supabaseUrl');
    const supabaseAnonKey = this.configService.get<string>(
      'database.supabaseAnonKey',
    );

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new BadRequestException(
        'Supabase authentication is not configured.',
      );
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return this.supabaseClient;
  }

  private getSupabaseAdminClient(): SupabaseClient | null {
    if (this.supabaseAdminClient) {
      return this.supabaseAdminClient;
    }

    const supabaseUrl = this.configService.get<string>('database.supabaseUrl');
    const serviceRoleKey = this.configService.get<string>(
      'database.supabaseServiceRoleKey',
    );

    if (!supabaseUrl || !serviceRoleKey) {
      this.logger.warn(
        'SUPABASE_SERVICE_ROLE_KEY is not configured; compensating rollback on registration failure will be skipped.',
      );
      return null;
    }

    this.supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return this.supabaseAdminClient;
  }

  async register(data: RegisterDto) {
    const supabase = this.getSupabaseClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists')
      ) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }
      throw new BadRequestException(error.message);
    }

    if (!authData.user) {
      throw new BadRequestException(
        'Supabase did not return a user after registration.',
      );
    }

    try {
      const applicationRole =
        data.role === PublicRegisterRole.STUDENT
          ? UserRole.STUDENT
          : UserRole.ORGANIZATION;

      const user = await this.usersService.createApplicationUser({
        id: authData.user.id,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        role: applicationRole,
      });

      return {
        user,
        session: authData.session,
      };
    } catch (appUserError: any) {
      this.logger.error(
        `Failed to create application user for Auth ID: ${authData.user.id}. Initiating compensating rollback. Error: ${appUserError.message}`,
      );

      // Compensating Transaction: Delete orphaned Supabase Auth record
      const adminClient = this.getSupabaseAdminClient();
      if (adminClient) {
        try {
          const { error: deleteError } =
            await adminClient.auth.admin.deleteUser(authData.user.id);

          if (deleteError) {
            this.logger.error(
              `Compensating rollback failed for Auth ID: ${authData.user.id}. Manual cleanup may be required: ${deleteError.message}`,
            );
          } else {
            this.logger.log(
              `Successfully deleted orphaned Supabase Auth user ID: ${authData.user.id} during rollback.`,
            );
          }
        } catch (cleanupError: any) {
          this.logger.error(
            `Unexpected error during compensating deletion for Auth ID: ${authData.user.id}: ${cleanupError.message}`,
          );
        }
      }

      throw appUserError;
    }
  }

  async login(data: LoginDto) {
    const supabase = this.getSupabaseClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!authData.user || !authData.session) {
      throw new UnauthorizedException(
        'Authentication failed. No session was returned.',
      );
    }

    const user = await this.usersService.getUserById(authData.user.id);

    return {
      user,
      session: authData.session,
    };
  }
}
