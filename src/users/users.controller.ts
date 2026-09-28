import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '@/auth/auth.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  async getUserById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    if (currentUser.id !== id) {
      let role = currentUser.role;
      if (!role) {
        const requester = await this.usersService.getRoleByAuthId(currentUser.id);
        role = requester.role;
      }

      if (role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'Forbidden: You are not authorized to access this user profile.',
        );
      }
    }

    return this.usersService.getUserById(id);
  }
}