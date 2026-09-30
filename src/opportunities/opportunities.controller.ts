import {
  Controller,
  Param,
  Post,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { OpportunitiesService } from './opportunities.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

import { SearchOpportunityDto } from './dto/search-opportunity.dto';
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
  createOpportunity() {
    return {
      message: 'Organization opportunity creation endpoint is protected.',
      role: UserRole.ORGANIZATION,
    };
  }

 
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

  @Get()
    searchOpportunities(@Query() query: SearchOpportunityDto) {
    return this.opportunitiesService.searchOpportunities(query);
  }

  @Get(':id')
  getOpportunity(@Param('id') id: string) {
  return this.opportunitiesService.getPublishedOpportunity(id);
}
}