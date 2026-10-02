import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  UserRole,
  OpportunityStatus,
  OrgVerificationStatus,
  SkillRequirementLevel,
} from '@prisma/client';


import { OpportunitiesRepository } from './opportunities.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { SearchOpportunityDto } from './dto/search-opportunity.dto';
import {
  CreateOpportunityData,
  OpportunityFilterOptions,
  OpportunityWithRelations,
  UpdateOpportunityData,
} from './opportunities.interface';
import {
  mapOpportunityForDetails,
  mapOpportunityForSearch,
} from './opportunity-response.mapper';


@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly opportunitiesRepository: OpportunitiesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createOpportunity(
    userId: string,
    data: CreateOpportunityDto,
  ): Promise<OpportunityWithRelations> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
    });

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException('Organization membership not found.');
    }

    if (
      data.minimumAcademicYear !== undefined &&
      data.maximumAcademicYear !== undefined &&
      data.minimumAcademicYear > data.maximumAcademicYear
    ) {
      throw new BadRequestException(
        'minimumAcademicYear cannot be greater than maximumAcademicYear.',
      );
    }

    if (data.status === OpportunityStatus.PUBLISHED) {
      if (
        membership.organization.verificationStatus !==
        OrgVerificationStatus.APPROVED
      ) {
        throw new ForbiddenException(
          'Only approved organizations can publish opportunities.',
        );
      }
    }

    const createPayload: CreateOpportunityData = {
      organizationId: membership.organizationId,
      title: data.title,
      description: data.description,
      opportunityType: data.opportunityType,
      status: data.status,
      location: data.location,
      isRemote: data.isRemote,
      applicationDeadline: data.applicationDeadline,
      minimumAcademicYear: data.minimumAcademicYear,
      maximumAcademicYear: data.maximumAcademicYear,
      minimumGpa: data.minimumGpa,
      eligibleFields: data.eligibleFields,
      compensation: data.compensation,
      applicationUrl: data.applicationUrl,
      skills: data.skills?.map((s) => ({
        skillId: s.skillId,
        requirementLevel: s.requirementLevel ?? SkillRequirementLevel.REQUIRED,
      })),
    };

    return this.opportunitiesRepository.create(createPayload);
  }

  async getMyOpportunities(
    userId: string,
  ): Promise<OpportunityWithRelations[]> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
    });

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException('Organization membership not found.');
    }

    return this.opportunitiesRepository.findByOrganizationId(
      membership.organizationId,
    );
  }

  async getMyOpportunity(
    userId: string,
    opportunityId: string,
  ): Promise<OpportunityWithRelations> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
    });

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

    return opportunity;
  }

  async updateOpportunity(
    userId: string,
    opportunityId: string,
    data: UpdateOpportunityDto,
  ): Promise<OpportunityWithRelations> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
    });

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException('Organization membership not found.');
    }

    const existing =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!existing) {
      throw new NotFoundException('Opportunity not found.');
    }

    const minYear =
      data.minimumAcademicYear !== undefined
        ? data.minimumAcademicYear
        : existing.minimumAcademicYear;
    const maxYear =
      data.maximumAcademicYear !== undefined
        ? data.maximumAcademicYear
        : existing.maximumAcademicYear;

    if (minYear !== null && maxYear !== null && minYear > maxYear) {
      throw new BadRequestException(
        'minimumAcademicYear cannot be greater than maximumAcademicYear.',
      );
    }

    if (
      data.status === OpportunityStatus.PUBLISHED &&
      existing.status !== OpportunityStatus.PUBLISHED
    ) {
      if (
        membership.organization.verificationStatus !==
        OrgVerificationStatus.APPROVED
      ) {
        throw new ForbiddenException(
          'Only approved organizations can publish opportunities.',
        );
      }
    }

    if (data.skills !== undefined) {
      await this.opportunitiesRepository.replaceSkills(
        opportunityId,
        data.skills.map((s) => ({
          skillId: s.skillId,
          requirementLevel: s.requirementLevel ?? SkillRequirementLevel.REQUIRED,
        })),
      );
    }

    const updatePayload: UpdateOpportunityData = {
      title: data.title,
      description: data.description,
      opportunityType: data.opportunityType,
      status: data.status,
      location: data.location,
      isRemote: data.isRemote,
      applicationDeadline: data.applicationDeadline,
      minimumAcademicYear: data.minimumAcademicYear,
      maximumAcademicYear: data.maximumAcademicYear,
      minimumGpa: data.minimumGpa,
      eligibleFields: data.eligibleFields,
      compensation: data.compensation,
      applicationUrl: data.applicationUrl,
    };

    await this.opportunitiesRepository.update(
      opportunityId,
      updatePayload,
      membership.organizationId,
    );

    const updated =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!updated) {
      throw new NotFoundException('Opportunity not found.');
    }

    return updated;
  }

  async deleteOpportunity(
    userId: string,
    opportunityId: string,
  ): Promise<{ message: string }> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
    });

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException('Organization membership not found.');
    }

    await this.opportunitiesRepository.softDelete(
      opportunityId,
      membership.organizationId,
    );

    return {
      message: 'Opportunity deleted successfully.',
    };
  }

  async publishOpportunity(
    userId: string,
    opportunityId: string,
  ): Promise<OpportunityWithRelations> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId },
      include: { organization: true },
    });

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException('Organization membership not found.');
    }

    if (
      membership.organization.verificationStatus !==
      OrgVerificationStatus.APPROVED
    ) {
      throw new ForbiddenException(
        'Only approved organizations can publish opportunities.',
      );
    }

    const existing =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!existing) {
      throw new NotFoundException('Opportunity not found.');
    }

    await this.opportunitiesRepository.update(
      opportunityId,
      { status: OpportunityStatus.PUBLISHED },
      membership.organizationId,
    );

    const updated =
      await this.opportunitiesRepository.findByIdAndOrganizationId(
        opportunityId,
        membership.organizationId,
      );

    if (!updated) {
      throw new NotFoundException('Opportunity not found.');
    }

    return updated;
  }

  async searchOpportunities(query: SearchOpportunityDto) {
    const filters: OpportunityFilterOptions = {
      status: OpportunityStatus.PUBLISHED,
      opportunityType: query.type,
      location: query.location,
      skillIds: query.skills ? [query.skills] : undefined,
      eligibleFields: query.field ? [query.field] : undefined,
      hasActiveDeadline: true,
    };

    const opportunities =
      await this.opportunitiesRepository.findMany(filters);

    return opportunities.map(mapOpportunityForSearch);
  }

  async getPublishedOpportunity(opportunityId: string) {
    const opportunity =
      await this.opportunitiesRepository.findById(opportunityId);

    if (
      !opportunity ||
      opportunity.status !== OpportunityStatus.PUBLISHED ||
      opportunity.deletedAt !== null
    ) {
      throw new NotFoundException('Opportunity not found.');
    }

    return mapOpportunityForDetails(opportunity);
  }

  async saveOpportunity(
  userId: string,
  opportunityId: string,
) {
  const studentProfile =
    await this.prisma.studentProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!studentProfile) {
    throw new NotFoundException(
      'Student profile not found.',
    );
  }

  const opportunity =
    await this.opportunitiesRepository.findById(
      opportunityId,
    );

  if (
    !opportunity ||
    opportunity.status !== OpportunityStatus.PUBLISHED ||
    opportunity.deletedAt !== null
  ) {
    throw new NotFoundException(
      'Opportunity not found.',
    );
  }

  try {
    return await this.opportunitiesRepository.saveOpportunity(
      studentProfile.userId,
      opportunityId,
    );
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ConflictException(
        'You have already saved this opportunity.',
      );
    }

    throw error;
  }
}

async removeSavedOpportunity(
  userId: string,
  opportunityId: string,
) {
  const studentProfile =
    await this.prisma.studentProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!studentProfile) {
    throw new NotFoundException(
      'Student profile not found.',
    );
  }

  try {
     await this.opportunitiesRepository.removeSavedOpportunity(
      studentProfile.userId,
      opportunityId,
    );
    return {
      message: 'Opportunity removed from saved opportunities.',
      studentProfileId: studentProfile.userId,
      opportunityId,
      deleted: true,
    };
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new NotFoundException(
        'Saved opportunity not found.',
      );
    }

    throw error;
  }
}

  async applyToOpportunity(
  userId: string,
  opportunityId: string,
) {
  const studentProfile =
    await this.prisma.studentProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!studentProfile) {
    throw new NotFoundException(
      'Student profile not found.',
    );
  }

  const opportunity =
    await this.opportunitiesRepository.findById(
      opportunityId,
    );

  if (
    !opportunity ||
    opportunity.status !== OpportunityStatus.PUBLISHED ||
    opportunity.deletedAt !== null
  ) {
    throw new NotFoundException(
      'Opportunity not found.',
    );
  }

  try {
    return await this.prisma.application.create({
      data: {
        studentProfileId: studentProfile.userId,
        opportunityId,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ConflictException(
        'You have already applied to this opportunity.',
      );
    }

    throw error;
  }
}

async getMyApplications(userId: string) {
  const studentProfile =
    await this.prisma.studentProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!studentProfile) {
    throw new NotFoundException(
      'Student profile not found.',
    );
  }

  return this.opportunitiesRepository.findApplicationsByStudentProfileId(
    studentProfile.userId,
  );
}

async updateApplicationStatus(
  userId: string,
  opportunityId: string,
  applicationId: string,
  status: ApplicationStatus,
) {
  const organizationMember =
    await this.prisma.organizationMember.findFirst({
      where: {
        userId,
      },
      include: {
        organization: true,
      },
    });

  if (
    !organizationMember ||
    organizationMember.organization.deletedAt !== null
  ) {
    throw new NotFoundException(
      'Organization not found.',
    );
  }

  const opportunity =
    await this.opportunitiesRepository.findById(
      opportunityId,
    );

  if (
    !opportunity ||
    opportunity.organizationId !==
      organizationMember.organizationId ||
    opportunity.deletedAt !== null
  ) {
    throw new NotFoundException(
      'Opportunity not found.',
    );
  }

  const application =
    await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        opportunityId,
      },
    });

  if (!application) {
    throw new NotFoundException(
      'Application not found.',
    );
  }

  const result =
    await this.opportunitiesRepository.updateApplicationStatus(
      applicationId,
      opportunityId,
      status,
    );

  if (result.count === 0) {
    throw new NotFoundException(
      'Application not found.',
    );
  }

  return this.prisma.application.findUnique({
    where: {
      id: applicationId,
    },
  });
}
}