import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { CreateOpportunityDto } from './create-opportunity.dto';
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
}