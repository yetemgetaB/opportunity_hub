import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { OrganizationProfileService } from './organization-profile.service';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('organizations/profile')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.ORGANIZATION)
export class OrganizationProfileController {
  constructor(
    private readonly organizationProfileService: OrganizationProfileService,
  ) {}

  @Get()
  async getMyProfile(
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationProfileService.getMyProfile(userId);
  }

  @Patch()
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() data: UpdateOrganizationProfileDto,
  ) {
    return this.organizationProfileService.updateMyProfile(
      userId,
      data,
    );
  }
}