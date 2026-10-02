import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { CreateOpportunityDto } from './create-opportunity.dto';
import { UpdateOpportunityDto } from './update-opportunity.dto';

@Injectable()
export class OpportunitiesRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findOrganizationIdByUserId(
    userId: string,
  ): Promise<string | null> {
    const membership =
      await this.prisma.organizationMember.findFirst({
        where: {
          userId,
        },
        select: {
          organizationId: true,
        },
      });

    return membership?.organizationId ?? null;
  }

  async create(
    organizationId: string,
    data: CreateOpportunityDto,
  ) {
    return this.prisma.opportunity.create({
      data: {
        organizationId,
        title: data.title,
        description: data.description,
        opportunityType: data.opportunityType,
        location: data.location,
        isRemote: data.isRemote ?? false,
        applicationDeadline: data.applicationDeadline
          ? new Date(data.applicationDeadline)
          : undefined,
        minimumAcademicYear:
          data.minimumAcademicYear,
        maximumAcademicYear:
          data.maximumAcademicYear,
        minimumGpa: data.minimumGpa,
        eligibleFields:
          data.eligibleFields ?? [],
        compensation: data.compensation,
        applicationUrl: data.applicationUrl,
      },
    });
  }

  async findById(opportunityId: string) {
    return this.prisma.opportunity.findFirst({
      where: {
        id: opportunityId,
        deletedAt: null,
      },
      include: {
        organization: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async update(
    opportunityId: string,
    organizationId: string,
    data: UpdateOpportunityDto,
  ) {
    return this.prisma.opportunity.updateMany({
      where: {
        id: opportunityId,
        organizationId,
        deletedAt: null,
      },
      data: {
        title: data.title,
        description: data.description,
        opportunityType: data.opportunityType,
        location: data.location,
        isRemote: data.isRemote,
        applicationDeadline: data.applicationDeadline
          ? new Date(data.applicationDeadline)
          : undefined,
        minimumAcademicYear:
          data.minimumAcademicYear,
        maximumAcademicYear:
          data.maximumAcademicYear,
        minimumGpa: data.minimumGpa,
        eligibleFields:
          data.eligibleFields,
        compensation: data.compensation,
        applicationUrl: data.applicationUrl,
      },
    });
  }
}