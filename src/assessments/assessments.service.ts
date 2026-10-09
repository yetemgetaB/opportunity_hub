import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  ApplicationStatus,
  AssessmentQuestionType,
  AssessmentStatus,
} from "@prisma/client";

import { AssessmentsRepository } from "./assessments.repository";
import { OrganizationProfileRepository } from "@/organization-profile/organization-profile.repository";
import { OpportunitiesRepository } from "@/opportunities/opportunities.repository";
import { AIQuestionService } from "./ai-question.service";
import { AIApplicantAnalysisService } from "./ai-applicant-analysis.service";
import { mapApplicantAnalysisData } from "./assessment-analysis.mapper";
import { AssessmentResultFilterDto } from "./dto/assessment-result-filter.dto";
import { SaveAssessmentResultData } from "./assessments.interface";
import { CvsService } from "@/student-profile/cvs.service";
import { NotificationsService } from "@/notifications/notifications.service";
import { ApplicationsRepository } from "@/applications/applications.repository";
@Injectable()
export class AssessmentsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly notificationsService: NotificationsService,
    private readonly assessmentsRepository: AssessmentsRepository,
    private readonly organizationProfileRepository: OrganizationProfileRepository,
    private readonly opportunitiesRepository: OpportunitiesRepository,
    private readonly aiQuestionService: AIQuestionService,
    private readonly aiApplicantAnalysisService: AIApplicantAnalysisService,
    private readonly cvsService: CvsService,
  ) {}

  async createAssessment(userId: string, opportunityId: string) {
    const membership =
      await this.organizationProfileRepository.findByUserId(userId);

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException("Organization membership not found.");
    }

    const opportunity =
      await this.opportunitiesRepository.findById(opportunityId);

    if (!opportunity) {
      throw new NotFoundException("Opportunity not found.");
    }

    if (opportunity.organizationId !== membership.organizationId) {
      throw new ForbiddenException(
        "You are not authorized to create an assessment for this opportunity.",
      );
    }

    // Get the skills explicitly marked as required for the opportunity.
    const requiredSkills = opportunity.skills
      .filter((item) => item.requirementLevel === "REQUIRED")
      .map((item) => item.skill.name);

    const generated = await this.aiQuestionService.generateQuestions({
      title: opportunity.title,
      description: opportunity.description ?? "",
      requiredSkills,
      location: opportunity.location ?? null,
      eligibleFields: opportunity.eligibleFields ?? [],
      minimumAcademicYear: opportunity.minimumAcademicYear ?? null,
      maximumAcademicYear: opportunity.maximumAcademicYear ?? null,
      minimumGpa: opportunity.minimumGpa
        ? Number(opportunity.minimumGpa)
        : null,
      opportunityType: opportunity.opportunityType ?? null,
    });

    const questions = generated.questions.map((item, index) => ({
      questionText: item.question,
      questionType: AssessmentQuestionType.TEXT,
      questionOrder: index + 1,
      isAiGenerated: true,
    }));

    return this.assessmentsRepository.create({
      opportunityId,
      title: `${opportunity.title} Assessment`,
      questions,
    });
  }

  async startAssessment(userId: string, opportunityId: string) {
    const membership =
      await this.organizationProfileRepository.findByUserId(userId);

    if (!membership || membership.organization?.deletedAt) {
      throw new NotFoundException("Organization membership not found.");
    }

    const opportunity =
      await this.opportunitiesRepository.findById(opportunityId);

    if (!opportunity) {
      throw new NotFoundException("Opportunity not found.");
    }

    if (opportunity.organizationId !== membership.organizationId) {
      throw new ForbiddenException(
        "You are not authorized to start an assessment for this opportunity.",
      );
    }

    if (!opportunity.applicationDeadline) {
      throw new BadRequestException(
        "This opportunity does not have an application deadline.",
      );
    }

    if (new Date() <= opportunity.applicationDeadline) {
      throw new BadRequestException(
        "The application deadline has not passed yet.",
      );
    }

    const assessment =
      await this.assessmentsRepository.findByOpportunityIdWithQuestions(
        opportunityId,
      );

    if (!assessment) {
      throw new NotFoundException("Assessment not found for this opportunity.");
    }

    if (assessment.status !== AssessmentStatus.DRAFT) {
      throw new BadRequestException(
        `Assessment cannot be started from ${assessment.status} status.`,
      );
    }

    const eligibleApplicants =
      await this.applicationsRepository.findByOpportunityId(opportunityId, {
        status: ApplicationStatus.SUBMITTED,
      });

    if (eligibleApplicants.length === 0) {
      throw new BadRequestException(
        "No eligible applicants found for this assessment.",
      );
    }

    const activatedAssessment = await this.assessmentsRepository.update(
      assessment.id,
      {
        status: AssessmentStatus.ACTIVE,
      },
    );

    for (const application of eligibleApplicants) {
      const studentUserId = application.studentProfile?.user?.id;

      if (!studentUserId) {
        continue;
      }

      await this.notificationsService.sendNotification(
        studentUserId,
        "Assessment Invitation",
        `You have been invited to complete the assessment for ${opportunity.title}.`,
        `assessment_invitation:${application.id}`,
      );
    }

    return activatedAssessment;
  }

  getAssessment(assessmentId: string) {
    return this.assessmentsRepository.getAssessment(assessmentId);
  }

  getAssessmentQuestions(assessmentId: string) {
    return this.assessmentsRepository.getAssessmentQuestions(assessmentId);
  }

  async startAttempt(
    userId: string,
    data: {
      applicationId: string;
      assessmentId: string;
    },
  ) {
    const application = await this.applicationsRepository.findById(
      data.applicationId,
    );

    if (!application) {
      throw new NotFoundException("Application not found.");
    }

    if (application.studentProfile.user.id !== userId) {
      throw new ForbiddenException(
        "You are not authorized to start an assessment for this application.",
      );
    }
    return this.assessmentsRepository.createAttempt(data);
  }

  async getAttempt(attemptId: string) {
    return this.assessmentsRepository.findAttemptById(attemptId);
  }

  async getAttemptWithAnswers(userId: string, attemptId: string) {
    const attempt =
      await this.assessmentsRepository.findAttemptByIdWithAnswers(attemptId);

    if (!attempt) {
      throw new NotFoundException("Assessment attempt not found.");
    }

    if (attempt.application.studentProfile.user.id !== userId) {
      throw new ForbiddenException(
        "You are not authorized to access this assessment attempt.",
      );
    }

    return attempt;
  }

  async getAttemptByApplicationId(applicationId: string) {
    return this.assessmentsRepository.findAttemptByApplicationId(applicationId);
  }

  async submitAttempt(userId: string, attemptId: string) {
    const attempt =
      await this.assessmentsRepository.findAttemptByIdWithAnswers(attemptId);

    if (!attempt) {
      throw new NotFoundException("Assessment attempt not found.");
    }

    if (attempt.application.studentProfile.user.id !== userId) {
      throw new ForbiddenException(
        "You are not authorized to submit this assessment attempt.",
      );
    }

    const submittedAttempt =
      await this.assessmentsRepository.submitAttempt(attemptId);

    await this.notificationsService.sendNotification(
      userId,
      "Assessment Completed",
      "Your assessment has been submitted successfully.",
      `assessment_completed:${attemptId}`,
    );

    return submittedAttempt;
  }

  async getSubmittedAttemptsByOpportunity(opportunityId: string) {
    return this.assessmentsRepository.findSubmittedAttemptsByOpportunityId(
      opportunityId,
    );
  }

  async getSubmittedAttemptsByAssessment(assessmentId: string) {
    return this.assessmentsRepository.findSubmittedAttemptsByAssessmentId(
      assessmentId,
    );
  }

  async saveAnswer(
    userId: string,
    data: {
      assessmentAttemptId: string;
      assessmentQuestionId: string;
      answerText: string;
    },
  ) {
    const attempt = await this.assessmentsRepository.findAttemptByIdWithAnswers(
      data.assessmentAttemptId,
    );

    if (!attempt) {
      throw new NotFoundException("Assessment attempt not found.");
    }

    if (attempt.application.studentProfile.user.id !== userId) {
      throw new ForbiddenException(
        "You are not authorized to answer this assessment attempt.",
      );
    }

    return this.assessmentsRepository.saveAnswer(data);
  }

  async saveAnswers(
    userId: string,
    attemptId: string,
    answers: Array<{
      assessmentQuestionId: string;
      answerText: string;
    }>,
  ) {
    const attempt =
      await this.assessmentsRepository.findAttemptByIdWithAnswers(attemptId);

    if (!attempt) {
      throw new NotFoundException("Assessment attempt not found.");
    }

    if (attempt.application.studentProfile.user.id !== userId) {
      throw new ForbiddenException(
        "You are not authorized to answer this assessment attempt.",
      );
    }

    return this.assessmentsRepository.saveAnswers(attemptId, answers);
  }

  async getAnswersByAttempt(attemptId: string) {
    return this.assessmentsRepository.findAnswersByAttemptId(attemptId);
  }

  async getApplicantAnalysisData(applicationId: string) {
    return this.assessmentsRepository.getApplicantAnalysisData(applicationId);
  }

  async getSubmittedApplicantAnalysisData(applicationId: string) {
    return this.assessmentsRepository.getSubmittedApplicantAnalysisData(
      applicationId,
    );
  }

  async buildApplicantAnalysisInput(applicationId: string) {
    const data =
      await this.assessmentsRepository.getSubmittedApplicantAnalysisData(
        applicationId,
      );

    if (!data) {
      throw new NotFoundException(
        "Submitted applicant analysis data not found.",
      );
    }

    const cvText = await this.cvsService.getCvTextForStudent(
      data.studentProfile.userId,
    );

    return mapApplicantAnalysisData(data, cvText);
  }

  async getEligibleApplicantsForAnalysis(opportunityId: string) {
    return this.assessmentsRepository.findEligibleApplicantsForAnalysis(
      opportunityId,
    );
  }

  async prepareApplicantAnalysis(userId: string, opportunityId: string) {
    const membership =
      await this.organizationProfileRepository.findByUserId(userId);

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException("Organization membership not found.");
    }

    const opportunity =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!opportunity) {
      throw new NotFoundException("Opportunity not found.");
    }

    const applicants =
      await this.assessmentsRepository.findEligibleApplicantsForAnalysis(
        opportunityId,
      );

    return {
      opportunityId,
      eligibleApplicants: applicants,
      totalEligibleApplicants: applicants.length,
    };
  }

  /**
   * Runs the real AI analysis for one submitted applicant.
   *
   * The applicant must belong to the requested opportunity,
   * and the opportunity must belong to the authenticated organization.
   */
  async analyzeApplicant(
    userId: string,
    opportunityId: string,
    applicationId: string,
  ) {
    const membership =
      await this.organizationProfileRepository.findByUserId(userId);

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException("Organization membership not found.");
    }

    const opportunity =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!opportunity) {
      throw new NotFoundException("Opportunity not found.");
    }

    const data =
      await this.assessmentsRepository.getSubmittedApplicantAnalysisData(
        applicationId,
      );

    if (!data) {
      throw new NotFoundException(
        "Submitted applicant analysis data not found.",
      );
    }

    if (data.opportunity.id !== opportunityId) {
      throw new NotFoundException(
        "Application does not belong to this opportunity.",
      );
    }

    if (!data.assessmentAttempt) {
      throw new NotFoundException("Submitted assessment attempt not found.");
    }

    const cvText = await this.cvsService.getCvTextForStudent(
      data.studentProfile.userId,
    );

    const analysisInput = mapApplicantAnalysisData(data, cvText);

    const analysis =
      await this.aiApplicantAnalysisService.analyzeApplicant(analysisInput);

    const resultData: SaveAssessmentResultData = {
      assessmentAttemptId: data.assessmentAttempt.id,
      aiScore: analysis.overallScore,
      aiRequirementMatch: analysis.requirementMatch,
      aiSkillAnalysis:
        analysis.skillAnalysis === null ? undefined : analysis.skillAnalysis,
      aiStrengths: analysis.strengths,
      aiGaps: analysis.gaps,
      aiSummary: analysis.summary,
      aiEvaluatedAt: new Date(),
    };

    const savedResult =
      await this.assessmentsRepository.saveAssessmentResult(resultData);

    return {
      applicationId,
      opportunityId,
      analysis,
      result: savedResult,
    };
  }

  async saveAssessmentResult(data: SaveAssessmentResultData) {
    return this.assessmentsRepository.saveAssessmentResult(data);
  }

  async getAssessmentResultById(id: string) {
    return this.assessmentsRepository.findAssessmentResultById(id);
  }

  async getAssessmentResultByAttemptId(attemptId: string) {
    return this.assessmentsRepository.findAssessmentResultByAttemptId(
      attemptId,
    );
  }

  async getAssessmentResultByApplicationId(applicationId: string) {
    return this.assessmentsRepository.findAssessmentResultByApplicationId(
      applicationId,
    );
  }

  async getAssessmentResultsByOpportunity(
    userId: string,
    opportunityId: string,
    options?: AssessmentResultFilterDto,
  ) {
    const membership =
      await this.organizationProfileRepository.findByUserId(userId);

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException("Organization membership not found.");
    }

    const opportunity =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!opportunity) {
      throw new NotFoundException("Opportunity not found.");
    }

    return this.assessmentsRepository.findAssessmentResultsByOpportunityId(
      opportunityId,
      options,
    );
  }
}
