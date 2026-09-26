import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'Authorization header is required.',
      );
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Authorization header must use Bearer token.',
      );
    }

    const supabaseUrl =
      this.configService.get<string>('supabaseUrl');

    const supabaseAnonKey =
      this.configService.get<string>('supabaseAnonKey');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new UnauthorizedException(
        'Supabase authentication is not configured.',
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
    );

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