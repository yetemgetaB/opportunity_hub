import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';

@Injectable()
export class OrganizationProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.organizationMember.findFirst({
      where: {
        userId,
      },
      include: {
        organization: true,
      },
    });
  }

  async update(
    organizationId: string,
    data: UpdateOrganizationProfileDto,
  ) {
    return this.prisma.organization.update({
      where: {
        id: organizationId,
      },
      data,
    });
  }
}