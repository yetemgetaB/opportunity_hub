import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AssessmentsService } from './assessments.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AssessmentResultFilterDto } from './dto/assessment-result-filter.dto';

@Controller()
export class AssessmentsController {
  constructor(
    private readonly assessmentsService: AssessmentsService,
  ) {}

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post('opportunities/:id/assessment')
  createAssessment(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) opportunityId: string,
  ) {
    return this.assessmentsService.createAssessment(
      userId,
      opportunityId,
    );
  }

    @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post('opportunities/:id/analyze-applicants')
  analyzeApplicants(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) opportunityId: string,
  ) {
    return this.assessmentsService.prepareApplicantAnalysis(
      userId,
      opportunityId,
    );
  }

    @UseGuards(SupabaseAuthGuard, RolesGuard)
    @Roles(UserRole.ORGANIZATION)
    @Get('opportunities/:id/candidate-results')
getCandidateResults(
  @CurrentUser('id') userId: string,
  @Param('id', ParseUUIDPipe) opportunityId: string,
  @Query() filters: AssessmentResultFilterDto,
) {
  return this.assessmentsService.getAssessmentResultsByOpportunity(
    userId,
    opportunityId,
    filters,
  );
}

  @UseGuards(SupabaseAuthGuard)
  @Get('assessments/:id')
  getAssessment(
    @Param('id', ParseUUIDPipe) assessmentId: string,
  ) {
    return this.assessmentsService.getAssessment(assessmentId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('assessments/:id/questions')
  getAssessmentQuestions(
    @Param('id', ParseUUIDPipe) assessmentId: string,
  ) {
    return this.assessmentsService.getAssessmentQuestions(
      assessmentId,
    );
  }
}