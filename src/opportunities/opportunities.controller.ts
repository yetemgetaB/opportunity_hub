import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { SearchOpportunityDto } from './dto/search-opportunity.dto';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
  ) {}

  // ORGANIZATION: Create opportunity
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post()
  async createOpportunity(
    @CurrentUser('id') userId: string,
    @Body() data: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.createOpportunity(userId, data);
  }

  // ORGANIZATION: View all opportunities belonging to authenticated organization
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Get('my')
  async getMyOpportunities(
    @CurrentUser('id') userId: string,
  ) {
    return this.opportunitiesService.getMyOpportunities(userId);
  }

  // ORGANIZATION: View one specific opportunity belonging to authenticated organization
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Get('my/:id')
  async getMyOpportunity(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.opportunitiesService.getMyOpportunity(userId, id);
  }

  // ORGANIZATION: Update opportunity
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Patch(':id')
  async updateOpportunity(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.updateOpportunity(userId, id, data);
  }

  // ORGANIZATION: Soft-delete opportunity
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Delete(':id')
  async deleteOpportunity(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.opportunitiesService.deleteOpportunity(userId, id);
  }

  // ORGANIZATION: Publish opportunity
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Patch(':id/publish')
  async publishOpportunity(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.opportunitiesService.publishOpportunity(userId, id);
  }

  // STUDENT: Apply to opportunity (placeholder)
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post(':id/apply')
  applyToOpportunity(@Param('id', ParseUUIDPipe) id: string) {
    return {
      message: 'Student opportunity application endpoint is protected.',
      opportunityId: id,
      role: UserRole.STUDENT,
    };
  }

  // ORGANIZATION: Opportunity assessment (placeholder)
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post(':id/assessment')
  createAssessment(@Param('id', ParseUUIDPipe) id: string) {
    return {
      message: 'Organization opportunity assessment endpoint is protected.',
      opportunityId: id,
      role: UserRole.ORGANIZATION,
    };
  }

  // PUBLIC: Search published opportunities
  @Get()
  async searchOpportunities(@Query() query: SearchOpportunityDto) {
    return this.opportunitiesService.searchOpportunities(query);
  }

  // PUBLIC: View single published opportunity
  @Get(':id')
  async getOpportunity(@Param('id', ParseUUIDPipe) id: string) {
    return this.opportunitiesService.getPublishedOpportunity(id);
  }
}