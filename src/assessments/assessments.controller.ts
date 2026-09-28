import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { AssessmentsService } from './assessments.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('organizations/applicants')
export class AssessmentsController {
  constructor(
    private readonly assessmentsService: AssessmentsService,
  ) {}

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Get(':id/assessment')
  getApplicantAssessment(@Param('id') id: string) {
    return {
      message: 'Organization applicant assessment endpoint is protected.',
      applicantId: id,
      role: UserRole.ORGANIZATION,
    };
  }
}