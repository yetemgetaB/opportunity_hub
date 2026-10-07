import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabaseClient: SupabaseClient | null = null;

  constructor(
    private readonly configService: ConfigService,
  ) {}

  private getSupabaseClient(): SupabaseClient {
    if (this.supabaseClient) {
      return this.supabaseClient;
    }

    const supabaseUrl =
      this.configService.get<string>(
        'database.supabaseUrl',
      );

    const supabaseAnonKey =
      this.configService.get<string>(
        'database.supabaseAnonKey',
      );

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new UnauthorizedException(
        'Supabase authentication is not configured.',
      );
    }

    this.supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    return this.supabaseClient;
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest();

    const authorization =
      request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'Authorization header is required.',
      );
    }

    const [type, token] =
      authorization.split(' ');

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
      throw new UnauthorizedException(
        'Invalid or expired access token.',
      );
    }

    request.user = user;

    return true;
  }
}