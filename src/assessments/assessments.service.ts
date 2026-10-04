import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AssessmentsRepository } from './assessments.repository';
import { OrganizationProfileRepository } from '@/organization-profile/organization-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';
import { mapApplicantAnalysisData } from './assessment-analysis.mapper';
import { AssessmentResultFilterDto } from './dto/assessment-result-filter.dto';

@Injectable()
export class AssessmentsService {
 constructor(
  private readonly assessmentsRepository: AssessmentsRepository,
  private readonly organizationProfileRepository: OrganizationProfileRepository,
  private readonly opportunitiesRepository: OpportunitiesRepository,
) {}

  async createAssessment(
  userId: string,
  opportunityId: string,
) {
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

  return this.assessmentsRepository.createAssessment(
    opportunityId,
    `${opportunity.title} Assessment`,
  );
}

  getAssessment(assessmentId: string) {
    return this.assessmentsRepository.getAssessment(assessmentId);
  }

  getAssessmentQuestions(assessmentId: string) {
    return this.assessmentsRepository.getAssessmentQuestions(
      assessmentId,
    );
  }

  // ==========================================================================
  // DAY 13: ATTEMPTS, ANSWERS & CANDIDATE ANALYSIS RESULT SERVICE METHODS
  // ==========================================================================

  /**
   * Start/create an assessment attempt for an application.
   */
  async startAttempt(data: {
    applicationId: string;
    assessmentId: string;
  }) {
    return this.assessmentsRepository.createAttempt(data);
  }

  /**
   * Retrieve attempt by ID.
   */
  async getAttempt(attemptId: string) {
    return this.assessmentsRepository.findAttemptById(attemptId);
  }

  /**
   * Retrieve attempt with its submitted answers and result.
   */
  async getAttemptWithAnswers(attemptId: string) {
    return this.assessmentsRepository.findAttemptByIdWithAnswers(attemptId);
  }

  /**
   * Retrieve attempt by application ID.
   */
  async getAttemptByApplicationId(applicationId: string) {
    return this.assessmentsRepository.findAttemptByApplicationId(applicationId);
  }

  /**
   * Submit an active attempt.
   */
  async submitAttempt(attemptId: string) {
    return this.assessmentsRepository.submitAttempt(attemptId);
  }

  /**
   * Retrieve all submitted attempts for an opportunity.
   */
  async getSubmittedAttemptsByOpportunity(opportunityId: string) {
    return this.assessmentsRepository.findSubmittedAttemptsByOpportunityId(
      opportunityId,
    );
  }

  /**
   * Retrieve all submitted attempts for a specific assessment.
   */
  async getSubmittedAttemptsByAssessment(assessmentId: string) {
    return this.assessmentsRepository.findSubmittedAttemptsByAssessmentId(
      assessmentId,
    );
  }

  /**
   * Persist a candidate answer to a question within an active attempt.
   */
  async saveAnswer(data: {
    assessmentAttemptId: string;
    assessmentQuestionId: string;
    answerText: string;
  }) {
    return this.assessmentsRepository.saveAnswer(data);
  }

  /**
   * Batch save candidate answers for an active attempt.
   */
  async saveAnswers(
    attemptId: string,
    answers: Array<{ assessmentQuestionId: string; answerText: string }>,
  ) {
    return this.assessmentsRepository.saveAnswers(attemptId, answers);
  }

  /**
   * Retrieve answers for an attempt ordered by question order.
   */
  async getAnswersByAttempt(attemptId: string) {
    return this.assessmentsRepository.findAnswersByAttemptId(attemptId);
  }

  /**
   * Retrieve complete applicant analysis data tree for Backend 1 & 3:
   * Opportunity -> Application -> StudentProfile (Skills, Experiences, CVs) -> Assessment -> Attempt -> Answers -> Result
   */
  async getApplicantAnalysisData(applicationId: string) {
    return this.assessmentsRepository.getApplicantAnalysisData(applicationId);
  }

  /**
   * Retrieve applicant analysis data strictly requiring attempt to be SUBMITTED.
   */
  async getSubmittedApplicantAnalysisData(applicationId: string) {
    return this.assessmentsRepository.getSubmittedApplicantAnalysisData(
      applicationId,
    );
  }

    /**
   * Build the AI-ready input for a submitted applicant assessment.
   *
   * This method only prepares the data.
   * Backend 3 will be responsible for the actual AI analysis.
   */
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

  /**
   * Retrieve all eligible applicants for an opportunity ready for AI analysis (SUBMITTED attempts only).
   */
  async getEligibleApplicantsForAnalysis(opportunityId: string) {
    return this.assessmentsRepository.findEligibleApplicantsForAnalysis(
      opportunityId,
    );
  }

    /**
   * Prepare eligible applicants for analysis.
   *
   * This verifies that the authenticated organization owns the
   * opportunity and retrieves only applicants who submitted
   * their assessment.
   *
   * Backend 3 AI analysis will be connected at the next stage.
   */
  async prepareApplicantAnalysis(
    userId: string,
    opportunityId: string,
  ) {
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
   * Persist candidate analysis result using the authoritative AssessmentResult model.
   */
  async saveAssessmentResult(data: any) {
    return this.assessmentsRepository.saveAssessmentResult(data);
  }

  /**
   * Retrieve candidate analysis result by result ID.
   */
  async getAssessmentResultById(id: string) {
    return this.assessmentsRepository.findAssessmentResultById(id);
  }

  /**
   * Retrieve candidate analysis result by attempt ID.
   */
  async getAssessmentResultByAttemptId(attemptId: string) {
    return this.assessmentsRepository.findAssessmentResultByAttemptId(attemptId);
  }

  /**
   * Retrieve candidate analysis result by application ID.
   */
  async getAssessmentResultByApplicationId(applicationId: string) {
    return this.assessmentsRepository.findAssessmentResultByApplicationId(
      applicationId,
    );
  }

  /**
   * Retrieve filtered & sorted assessment results for an opportunity.
   */
  async getAssessmentResultsByOpportunity(
  userId: string,
  opportunityId: string,
  options?: AssessmentResultFilterDto,
) {
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

  return this.assessmentsRepository.findAssessmentResultsByOpportunityId(
    opportunityId,
    options,
  );
}
}
