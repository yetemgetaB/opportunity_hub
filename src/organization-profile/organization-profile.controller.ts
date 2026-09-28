import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrganizationProfileService } from './organization-profile.service';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
import {
  AuthenticatedRequest,
  SupabaseAuthGuard,
} from '../auth/guards/supabase-auth.guard';

@Controller('organizations/profile')
@UseGuards(SupabaseAuthGuard)
export class OrganizationProfileController {
  constructor(
    private readonly organizationProfileService: OrganizationProfileService,
  ) {}

  @Get()
  async getMyProfile(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.organizationProfileService.getMyProfile(
      request.user.id,
    );
  }

  @Patch()
  async updateMyProfile(
    @Req() request: AuthenticatedRequest,
    @Body() data: UpdateOrganizationProfileDto,
  ) {
    return this.organizationProfileService.updateMyProfile(
      request.user.id,
      data,
    );
  }
}