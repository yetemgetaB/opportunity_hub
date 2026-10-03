import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AssessmentsRepository } from './assessments.repository';
import { OrganizationProfileRepository } from '@/organization-profile/organization-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';

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
}