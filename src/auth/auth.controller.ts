import {
  Body,
  Controller,
  Headers,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SupabaseAuthGuard } from './guards/supabase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Patch('password')
  @UseGuards(SupabaseAuthGuard)
  async updatePassword(
    @Body() data: UpdatePasswordDto,
    @Headers('authorization') authorization: string,
  ) {
    return this.authService.updatePassword(
      data.newPassword,
      authorization,
    );
  }
}