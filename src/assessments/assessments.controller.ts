import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";

import { AssessmentsService } from "./assessments.service";
import { SupabaseAuthGuard } from "@/auth/guards/supabase-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { AssessmentResultFilterDto } from "./dto/assessment-result-filter.dto";
import { StartAssessmentAttemptDto } from "./dto/start-assessment-attempt.dto";
import { SaveAssessmentAnswerDto } from "./dto/save-assessment-answer.dto";

@Controller()
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post("opportunities/:id/assessment")
  createAssessment(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) opportunityId: string,
  ) {
    return this.assessmentsService.createAssessment(userId, opportunityId);
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post("opportunities/:id/assessment/start")
  startAssessment(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) opportunityId: string,
  ) {
    return this.assessmentsService.startAssessment(userId, opportunityId);
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post("opportunities/:id/analyze-applicants")
  analyzeApplicants(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) opportunityId: string,
  ) {
    return this.assessmentsService.prepareApplicantAnalysis(
      userId,
      opportunityId,
    );
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Post("opportunities/:opportunityId/applicants/:applicationId/analyze")
  analyzeApplicant(
    @CurrentUser("id") userId: string,
    @Param("opportunityId", ParseUUIDPipe) opportunityId: string,
    @Param("applicationId", ParseUUIDPipe) applicationId: string,
  ) {
    return this.assessmentsService.analyzeApplicant(
      userId,
      opportunityId,
      applicationId,
    );
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZATION)
  @Get("opportunities/:id/candidate-results")
  getCandidateResults(
    @CurrentUser("id") userId: string,
    @Param("id", ParseUUIDPipe) opportunityId: string,
    @Query() filters: AssessmentResultFilterDto,
  ) {
    return this.assessmentsService.getAssessmentResultsByOpportunity(
      userId,
      opportunityId,
      filters,
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Get("assessments/:id")
  getAssessment(@Param("id", ParseUUIDPipe) assessmentId: string) {
    return this.assessmentsService.getAssessment(assessmentId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get("assessments/:id/questions")
  getAssessmentQuestions(@Param("id", ParseUUIDPipe) assessmentId: string) {
    return this.assessmentsService.getAssessmentQuestions(assessmentId);
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post("assessments/:assessmentId/attempt")
  startAttempt(
    @CurrentUser("id") userId: string,
    @Param("assessmentId", ParseUUIDPipe) assessmentId: string,
    @Body() dto: StartAssessmentAttemptDto,
  ) {
    return this.assessmentsService.startAttempt(userId, {
      applicationId: dto.applicationId,
      assessmentId,
    });
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get("assessments/attempts/:attemptId")
  getAttempt(
    @CurrentUser("id") userId: string,
    @Param("attemptId", ParseUUIDPipe) attemptId: string,
  ) {
    return this.assessmentsService.getAttemptWithAnswers(userId, attemptId);
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post("assessments/attempts/:attemptId/answers")
  saveAnswer(
    @CurrentUser("id") userId: string,
    @Param("attemptId", ParseUUIDPipe) attemptId: string,
    @Body() dto: SaveAssessmentAnswerDto,
  ) {
    return this.assessmentsService.saveAnswer(userId, {
      assessmentAttemptId: attemptId,
      assessmentQuestionId: dto.assessmentQuestionId,
      answerText: dto.answerText,
    });
  }

  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post("assessments/attempts/:attemptId/submit")
  submitAttempt(
    @CurrentUser("id") userId: string,
    @Param("attemptId", ParseUUIDPipe) attemptId: string,
  ) {
    return this.assessmentsService.submitAttempt(userId, attemptId);
  }
}
