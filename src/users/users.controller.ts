import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserData } from './users.interface';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
 }

  @Post()
  async createUser(@Body() data: CreateUserData) {
    return this.usersService.createApplicationUser(data);
  }
}