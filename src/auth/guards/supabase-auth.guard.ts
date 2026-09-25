import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersRepository } from '../../users/users.repository';
import { AuthenticatedUser } from '../auth.interface';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase: SupabaseClient | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
  ) {}

  private getSupabaseClient(): SupabaseClient {
    if (this.supabase) {
      return this.supabase;
    }

    const supabaseUrl = this.configService.get<string>('database.supabaseUrl');
    const supabaseAnonKey = this.configService.get<string>(
      'database.supabaseAnonKey',
    );

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new UnauthorizedException(
        'Supabase authentication is not configured.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return this.supabase;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required.');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Authorization header must use Bearer token.',
      );
    }

    const supabase = this.getSupabaseClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    // Resolve application user record and verify active status
    const appUser = await this.usersRepository.findById(user.id);

    if (!appUser) {
      throw new UnauthorizedException(
        'No application user profile found for authenticated identity.',
      );
    }

    if (!appUser.isActive || appUser.deletedAt !== null) {
      throw new UnauthorizedException('User account is deactivated.');
    }

    // Attach validated application context to request.user
    const authContext: AuthenticatedUser = {
      id: appUser.id,
      email: user.email,
      role: appUser.role,
      isActive: appUser.isActive,
    };

    request.user = authContext;

    return true;
  }
}
