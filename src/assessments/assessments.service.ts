import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssessmentQuestionType } from '@prisma/client';

import { AssessmentsRepository } from './assessments.repository';
import { OrganizationProfileRepository } from '@/organization-profile/organization-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';
import { AIQuestionService } from './ai-question.service';
import { AIApplicantAnalysisService } from './ai-applicant-analysis.service';
import { mapApplicantAnalysisData } from './assessment-analysis.mapper';
import { AssessmentResultFilterDto } from './dto/assessment-result-filter.dto';
import { SaveAssessmentResultData } from './assessments.interface';

@Injectable()
export class AssessmentsService {
  constructor(
    private readonly assessmentsRepository: AssessmentsRepository,
    private readonly organizationProfileRepository: OrganizationProfileRepository,
    private readonly opportunitiesRepository: OpportunitiesRepository,
    private readonly aiQuestionService: AIQuestionService,
    private readonly aiApplicantAnalysisService: AIApplicantAnalysisService,
  ) {}

  async createAssessment(userId: string, opportunityId: string) {
    const membership =
      await this.organizationProfileRepository.findByUserId(userId);

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException('Organization membership not found.');
    }

    const opportunity =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found.');
    }

    const requiredSkills = opportunity.skills
      .filter((item) => item.requirementLevel === 'REQUIRED')
      .map((item) => item.skill.name);

    const generated =
      await this.aiQuestionService.generateQuestions({
        title: opportunity.title,
        description: opportunity.description ?? '',
        requiredSkills,
        location: opportunity.location ?? null,
        eligibleFields: opportunity.eligibleFields ?? [],
        minimumAcademicYear:
          opportunity.minimumAcademicYear ?? null,
        maximumAcademicYear:
          opportunity.maximumAcademicYear ?? null,
        minimumGpa: opportunity.minimumGpa
          ? Number(opportunity.minimumGpa)
          : null,
        opportunityType:
          opportunity.opportunityType ?? null,
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

  getAssessment(assessmentId: string) {
    return this.assessmentsRepository.getAssessment(assessmentId);
  }

  getAssessmentQuestions(assessmentId: string) {
    return this.assessmentsRepository.getAssessmentQuestions(assessmentId);
  }

  async startAttempt(data: {
    applicationId: string;
    assessmentId: string;
  }) {
    return this.assessmentsRepository.createAttempt(data);
  }

  async getAttempt(attemptId: string) {
    return this.assessmentsRepository.findAttemptById(attemptId);
  }

  async getAttemptWithAnswers(attemptId: string) {
    return this.assessmentsRepository.findAttemptByIdWithAnswers(attemptId);
  }

  async getAttemptByApplicationId(applicationId: string) {
    return this.assessmentsRepository.findAttemptByApplicationId(applicationId);
  }

  async submitAttempt(attemptId: string) {
    return this.assessmentsRepository.submitAttempt(attemptId);
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

  async saveAnswer(data: {
    assessmentAttemptId: string;
    assessmentQuestionId: string;
    answerText: string;
  }) {
    return this.assessmentsRepository.saveAnswer(data);
  }

  async saveAnswers(
    attemptId: string,
    answers: Array<{
      assessmentQuestionId: string;
      answerText: string;
    }>,
  ) {
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
        'Submitted applicant analysis data not found.',
      );
    }

    return mapApplicantAnalysisData(data);
  }

  async getEligibleApplicantsForAnalysis(opportunityId: string) {
    return this.assessmentsRepository.findEligibleApplicantsForAnalysis(
      opportunityId,
    );
  }

  async prepareApplicantAnalysis(
    userId: string,
    opportunityId: string,
  ) {
    const membership =
      await this.organizationProfileRepository.findByUserId(userId);

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException(
        'Organization membership not found.',
      );
    }

    const opportunity =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found.');
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
      throw new NotFoundException(
        'Organization membership not found.',
      );
    }

    const opportunity =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found.');
    }

    const data =
      await this.assessmentsRepository.getSubmittedApplicantAnalysisData(
        applicationId,
      );

    if (!data) {
      throw new NotFoundException(
        'Submitted applicant analysis data not found.',
      );
    }

    if (data.opportunity.id !== opportunityId) {
      throw new NotFoundException(
        'Application does not belong to this opportunity.',
      );
    }

    if (!data.assessmentAttempt) {
      throw new NotFoundException(
        'Submitted assessment attempt not found.',
      );
    }

    const analysisInput = mapApplicantAnalysisData(data);

    const analysis =
      await this.aiApplicantAnalysisService.analyzeApplicant(
        analysisInput,
      );

    const resultData: SaveAssessmentResultData = {
      assessmentAttemptId: data.assessmentAttempt.id,
      aiScore: analysis.overallScore,
      aiRequirementMatch: analysis.requirementMatch,
      aiSkillAnalysis:
        analysis.skillAnalysis === null
          ? undefined
          : analysis.skillAnalysis,
      aiStrengths: analysis.strengths,
      aiGaps: analysis.gaps,
      aiSummary: analysis.summary,
      aiEvaluatedAt: new Date(),
    };

    const savedResult =
      await this.assessmentsRepository.saveAssessmentResult(
        resultData,
      );

    return {
      applicationId,
      opportunityId,
      analysis,
      result: savedResult,
    };
  }

  async saveAssessmentResult(
    data: SaveAssessmentResultData,
  ) {
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

  async getAssessmentResultByApplicationId(
    applicationId: string,
  ) {
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
      throw new NotFoundException(
        'Organization membership not found.',
      );
    }

    const opportunity =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found.');
    }

    return this.assessmentsRepository.findAssessmentResultsByOpportunityId(
      opportunityId,
      options,
    );
  }
}