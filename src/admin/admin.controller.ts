import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AdminService } from './admin.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('profile')
  getProfile() {
    return {
      message: 'Admin profile endpoint is protected.',
      role: UserRole.ADMIN,
    };
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('users')
  getUsers() {
    return {
      message: 'Admin users endpoint is protected.',
      role: UserRole.ADMIN,
    };
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('organizations')
  getOrganizations() {
    return {
      message: 'Admin organizations endpoint is protected.',
      role: UserRole.ADMIN,
    };
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('opportunities')
  getOpportunities() {
    return {
      message: 'Admin opportunities endpoint is protected.',
      role: UserRole.ADMIN,
    };
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('reports')
  getReports() {
    return {
      message: 'Admin reports endpoint is protected.',
      role: UserRole.ADMIN,
    };
  }
}