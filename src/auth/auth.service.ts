import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private getSupabaseClient(): SupabaseClient {
    const supabaseUrl =
      this.configService.get<string>('supabaseUrl');

    const supabaseAnonKey =
      this.configService.get<string>('supabaseAnonKey');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new BadRequestException(
        'Supabase authentication is not configured.',
      );
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  }

  async register(data: RegisterDto) {
    const supabase = this.getSupabaseClient();

    const { data: authData, error } =
      await supabase.auth.signUp({
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

    const user =
      await this.usersService.createApplicationUser({
        id: authData.user.id,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        role: data.role,
      });

    return {
      user,
      session: authData.session,
    };
  }

  async login(data: LoginDto) {
    const supabase = this.getSupabaseClient();

    const { data: authData, error } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (error) {
      throw new UnauthorizedException(
        'Invalid email or password.',
      );
    }

    if (!authData.user || !authData.session) {
      throw new UnauthorizedException(
        'Authentication failed. No session was returned.',
      );
    }

    const user =
      await this.usersService.getUserById(authData.user.id);

    return {
      user,
      session: authData.session,
    };
  }
}
