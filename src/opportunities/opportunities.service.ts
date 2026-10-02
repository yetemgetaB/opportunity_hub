import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateOpportunityDto } from './create-opportunity.dto';
import { UpdateOpportunityDto } from './update-opportunity.dto';
import { OpportunitiesRepository } from './opportunities.repository';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly opportunitiesRepository: OpportunitiesRepository,
  ) {}

  async createOpportunity(
    userId: string,
    data: CreateOpportunityDto,
  ) {
    const organizationId =
      await this.opportunitiesRepository.findOrganizationIdByUserId(
        userId,
      );

    if (!organizationId) {
      throw new ForbiddenException(
        'You are not associated with an organization.',
      );
    }

    return this.opportunitiesRepository.create(
      organizationId,
      data,
    );
  }

  async getOpportunityById(
    opportunityId: string,
  ) {
    const opportunity =
      await this.opportunitiesRepository.findById(
        opportunityId,
      );

    if (!opportunity) {
      throw new NotFoundException(
        'Opportunity not found.',
      );
    }

    return opportunity;
  }

  async updateOpportunity(
    userId: string,
    opportunityId: string,
    data: UpdateOpportunityDto,
  ) {
    const organizationId =
      await this.opportunitiesRepository.findOrganizationIdByUserId(
        userId,
      );

    if (!organizationId) {
      throw new ForbiddenException(
        'You are not associated with an organization.',
      );
    }

    const result =
      await this.opportunitiesRepository.update(
        opportunityId,
        organizationId,
        data,
      );

    if (result.count === 0) {
      throw new ForbiddenException(
        'You do not have permission to update this opportunity.',
      );
    }

    return {
      message: 'Opportunity updated successfully.',
    };
  }
}