import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AdminService } from './admin.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { AdminProfileResponseDto } from './dto/admin-profile-response.dto';

@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('profile')
  async getProfile(
    @CurrentUser('id') adminUserId: string,
  ): Promise<AdminProfileResponseDto> {
    return this.adminService.getProfile(adminUserId);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser('id') adminUserId: string,
    @Body() dto: UpdateAdminProfileDto,
  ): Promise<AdminProfileResponseDto> {
    return this.adminService.updateProfile(adminUserId, dto);
  }

  @Get('users')
  getUsers() {
    return {
      message: 'Admin users endpoint is protected.',
      role: UserRole.ADMIN,
    };
  }

  @Get('organizations')
  getOrganizations() {
    return {
      message: 'Admin organizations endpoint is protected.',
      role: UserRole.ADMIN,
    };
  }

  @Get('opportunities')
  getOpportunities() {
    return {
      message: 'Admin opportunities endpoint is protected.',
      role: UserRole.ADMIN,
    };
  }

  @Get('reports')
  getReports() {
    return {
      message: 'Admin reports endpoint is protected.',
      role: UserRole.ADMIN,
    };
  }
}