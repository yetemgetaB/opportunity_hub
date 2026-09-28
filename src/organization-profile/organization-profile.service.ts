import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { OrganizationProfileRepository } from './organization-profile.repository';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';

@Injectable()
export class OrganizationProfileService {
  constructor(
    private readonly organizationProfileRepository: OrganizationProfileRepository,
  ) {}

  async getMyProfile(userId: string) {
    const membership =
      await this.organizationProfileRepository.findByUserId(
        userId,
      );

    if (!membership) {
      throw new NotFoundException(
        'Organization profile not found.',
      );
    }

    return membership.organization;
  }

  async updateMyProfile(
    userId: string,
    data: UpdateOrganizationProfileDto,
  ) {
    const membership =
      await this.organizationProfileRepository.findByUserId(
        userId,
      );

    if (!membership) {
      throw new NotFoundException(
        'Organization profile not found.',
      );
    }

    return this.organizationProfileRepository.update(
      membership.organizationId,
      data,
    );
  }
}