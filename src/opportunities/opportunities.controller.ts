import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './create-opportunity.dto';
import { UpdateOpportunityDto } from './update-opportunity.dto';

import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
  ) {}

  // STUDENT
  // POST /opportunities/:id/apply
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post(':id/apply')
  applyToOpportunity(@Param('id') id: string) {
    return {
      message: 'Student opportunity application endpoint is protected.',
      opportunityId: id,
      role: UserRole.STUDENT,
    };
  }

  // ORGANIZATION
  // POST /opportunities
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post()
  createOpportunity(
    @CurrentUser('id') userId: string,
    @Body() data: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.createOpportunity(
      userId,
      data,
    );
  }

  // ORGANIZATION
  // PATCH /opportunities/:id
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Patch(':id')
  updateOpportunity(
    @Param('id') opportunityId: string,
    @CurrentUser('id') userId: string,
    @Body() data: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.updateOpportunity(
      userId,
      opportunityId,
      data,
    );
  }

  // ORGANIZATION
  // POST /opportunities/:id/assessment
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post(':id/assessment')
  createAssessment(@Param('id') id: string) {
    return {
      message: 'Organization opportunity assessment endpoint is protected.',
      opportunityId: id,
      role: UserRole.ORGANIZATION,
    };
  }
}