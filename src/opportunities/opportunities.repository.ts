import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  ApplicationStatus,
  OpportunityStatus,
  Prisma,
  SkillRequirementLevel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOpportunityData,
  OpportunityFilterOptions,
  OpportunitySkillInput,
  OpportunitySkillWithSkill,
  OpportunityWithRelations,
  UpdateOpportunityData,
} from './opportunities.interface';

@Injectable()
export class OpportunitiesRepository {
  private readonly logger = new Logger(OpportunitiesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Persist a new opportunity in the database with optional initial skill associations.
   * Uses Prisma nested create / transaction when initial skills are provided.
   */
  async create(data: CreateOpportunityData): Promise<OpportunityWithRelations> {
    const status = data.status ?? OpportunityStatus.DRAFT;
    const publishedAt =
      data.publishedAt !== undefined
        ? data.publishedAt
        : status === OpportunityStatus.PUBLISHED
          ? new Date()
          : null;

    const createPayload: Prisma.OpportunityCreateInput = {
      organization: {
        connect: { id: data.organizationId },
      },
      title: data.title.trim(),
      description: data.description.trim(),
      opportunityType: data.opportunityType,
      status,
      location: data.location ? data.location.trim() : null,
      isRemote: data.isRemote ?? false,
      applicationDeadline: data.applicationDeadline
        ? new Date(data.applicationDeadline)
        : null,
      minimumAcademicYear: data.minimumAcademicYear ?? null,
      maximumAcademicYear: data.maximumAcademicYear ?? null,
      minimumGpa:
        data.minimumGpa !== undefined && data.minimumGpa !== null
          ? new Prisma.Decimal(data.minimumGpa)
          : null,
      eligibleFields: data.eligibleFields ?? [],
      compensation: data.compensation ? data.compensation.trim() : null,
      applicationUrl: data.applicationUrl ? data.applicationUrl.trim() : null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    };

    if (data.skills && data.skills.length > 0) {
      createPayload.skills = {
        create: data.skills.map((s) => ({
          skill: { connect: { id: s.skillId } },
          requirementLevel: s.requirementLevel ?? SkillRequirementLevel.REQUIRED,
        })),
      };
    }

    const created = await this.prisma.opportunity.create({
      data: createPayload,
      include: {
        organization: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    this.logger.log(
      `Created opportunity ${created.id} ("${created.title}") for organization ${data.organizationId} [Status: ${created.status}]`,
    );

    return created;
  }

  /**
   * Look up an opportunity by its primary identifier.
   * Excludes soft-deleted records by default.
   */
  async findById(
    id: string,
    options?: { includeDeleted?: boolean },
  ): Promise<OpportunityWithRelations | null> {
    const whereClause: Prisma.OpportunityWhereInput = { id };
    if (!options?.includeDeleted) {
      whereClause.deletedAt = null;
    }

    return this.prisma.opportunity.findFirst({
      where: whereClause,
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

  async saveOpportunity(
  studentProfileId: string,
  opportunityId: string,
) {
  return this.prisma.savedOpportunity.create({
    data: {
      studentProfileId,
      opportunityId,
    },
  });
}

async removeSavedOpportunity(
    studentProfileId: string,
    opportunityId: string,
  ) {
    return this.prisma.savedOpportunity.delete({
      where: {
        studentProfileId_opportunityId: {
          studentProfileId,
          opportunityId,
        },
      },
    });
  }

  async findApplicationsByStudentProfileId(
  studentProfileId: string,
) {
  return this.prisma.application.findMany({
    where: {
      studentProfileId,
    },
    include: {
      opportunity: true,
    },
    orderBy: {
      appliedAt: 'desc',
    },
  });
}

async updateApplicationStatus(
  applicationId: string,
  opportunityId: string,
  status: ApplicationStatus,
) {
  return this.prisma.application.updateMany({
    where: {
      id: applicationId,
      opportunityId,
    },
    data: {
      status,
    },
  });
}

  /**
   * Look up an opportunity specifically scoped by organization ownership.
   */
  async findByIdAndOrganizationId(
    id: string,
    organizationId: string,
    options?: { includeDeleted?: boolean },
  ): Promise<OpportunityWithRelations | null> {
    const whereClause: Prisma.OpportunityWhereInput = {
      id,
      organizationId,
    };
    if (!options?.includeDeleted) {
      whereClause.deletedAt = null;
    }

    return this.prisma.opportunity.findFirst({
      where: whereClause,
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

  /**
   * Retrieve all opportunities belonging to a specific organization.
   */
  async findByOrganizationId(
    organizationId: string,
    options?: {
      includeDeleted?: boolean;
      status?: OpportunityStatus;
      skip?: number;
      take?: number;
    },
  ): Promise<OpportunityWithRelations[]> {
    const whereClause: Prisma.OpportunityWhereInput = {
      organizationId,
    };

    if (!options?.includeDeleted) {
      whereClause.deletedAt = null;
    }

    if (options?.status) {
      whereClause.status = options.status;
    }

    return this.prisma.opportunity.findMany({
      where: whereClause,
      include: {
        organization: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Retrieve opportunities matching structured filters for discovery, matching, and search.
   * Automatically excludes soft-deleted records unless explicitly requested.
   */
  async findMany(
    filters: OpportunityFilterOptions = {},
  ): Promise<OpportunityWithRelations[]> {
    const whereClause = this.buildWhereClause(filters);

    return this.prisma.opportunity.findMany({
      where: whereClause,
      include: {
        organization: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: filters.orderBy ?? { createdAt: 'desc' },
      skip: filters.skip,
      take: filters.take,
    });
  }

  /**
   * Count total opportunities matching given filters.
   */
  async count(filters: OpportunityFilterOptions = {}): Promise<number> {
    const whereClause = this.buildWhereClause(filters);
    return this.prisma.opportunity.count({
      where: whereClause,
    });
  }

  /**
   * Update an existing active opportunity.
   * If organizationId is provided, ownership is verified as part of the query condition.
   */
  async update(
    id: string,
    data: UpdateOpportunityData,
    organizationId?: string,
  ): Promise<OpportunityWithRelations> {
    const whereClause: Prisma.OpportunityWhereUniqueInput = { id };

    // Verify record exists and is active (not soft-deleted)
    const existing = await this.prisma.opportunity.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(organizationId ? { organizationId } : {}),
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Active opportunity not found with ID ${id}${
          organizationId ? ` for organization ${organizationId}` : ''
        }`,
      );
    }

    const updatePayload: Prisma.OpportunityUpdateInput = {};

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined)
      updatePayload.description = data.description.trim();
    if (data.opportunityType !== undefined)
      updatePayload.opportunityType = data.opportunityType;
    if (data.location !== undefined)
      updatePayload.location = data.location ? data.location.trim() : null;
    if (data.isRemote !== undefined) updatePayload.isRemote = data.isRemote;
    if (data.applicationDeadline !== undefined) {
      updatePayload.applicationDeadline = data.applicationDeadline
        ? new Date(data.applicationDeadline)
        : null;
    }
    if (data.minimumAcademicYear !== undefined)
      updatePayload.minimumAcademicYear = data.minimumAcademicYear;
    if (data.maximumAcademicYear !== undefined)
      updatePayload.maximumAcademicYear = data.maximumAcademicYear;
    if (data.minimumGpa !== undefined) {
      updatePayload.minimumGpa =
        data.minimumGpa !== null ? new Prisma.Decimal(data.minimumGpa) : null;
    }
    if (data.eligibleFields !== undefined)
      updatePayload.eligibleFields = data.eligibleFields;
    if (data.compensation !== undefined)
      updatePayload.compensation = data.compensation
        ? data.compensation.trim()
        : null;
    if (data.applicationUrl !== undefined)
      updatePayload.applicationUrl = data.applicationUrl
        ? data.applicationUrl.trim()
        : null;

    if (data.status !== undefined) {
      updatePayload.status = data.status;
      if (
        data.status === OpportunityStatus.PUBLISHED &&
        !existing.publishedAt &&
        data.publishedAt === undefined
      ) {
        updatePayload.publishedAt = new Date();
      }
    }

    if (data.publishedAt !== undefined) {
      updatePayload.publishedAt = data.publishedAt
        ? new Date(data.publishedAt)
        : null;
    }

    return this.prisma.opportunity.update({
      where: whereClause,
      data: updatePayload,
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

  /**
   * Soft-delete an opportunity by setting deleted_at timestamp.
   * Does not physically remove records, preserving referential audit integrity.
   */
  async softDelete(
    id: string,
    organizationId?: string,
  ): Promise<OpportunityWithRelations> {
    const existing = await this.prisma.opportunity.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(organizationId ? { organizationId } : {}),
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Active opportunity not found with ID ${id}${
          organizationId ? ` for organization ${organizationId}` : ''
        }`,
      );
    }

    return this.prisma.opportunity.update({
      where: { id },
      data: {
        deletedAt: new Date(),
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

  /**
   * Attach or update a skill requirement for an opportunity.
   */
  async addSkill(
    opportunityId: string,
    skillId: string,
    requirementLevel: SkillRequirementLevel = SkillRequirementLevel.REQUIRED,
  ): Promise<OpportunitySkillWithSkill> {
    return this.prisma.opportunitySkill.upsert({
      where: {
        opportunityId_skillId: {
          opportunityId,
          skillId,
        },
      },
      create: {
        opportunityId,
        skillId,
        requirementLevel,
      },
      update: {
        requirementLevel,
      },
      include: {
        skill: true,
      },
    });
  }

  /**
   * Remove a skill association from an opportunity.
   */
  async removeSkill(opportunityId: string, skillId: string): Promise<void> {
    await this.prisma.opportunitySkill.deleteMany({
      where: {
        opportunityId,
        skillId,
      },
    });
  }

  /**
   * Atomically replace all skills attached to an opportunity using a Prisma transaction.
   */
  async replaceSkills(
    opportunityId: string,
    skills: OpportunitySkillInput[],
  ): Promise<OpportunitySkillWithSkill[]> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Remove existing skill links
      await tx.opportunitySkill.deleteMany({
        where: { opportunityId },
      });

      // 2. Insert new skill links
      if (skills.length > 0) {
        await tx.opportunitySkill.createMany({
          data: skills.map((s) => ({
            opportunityId,
            skillId: s.skillId,
            requirementLevel:
              s.requirementLevel ?? SkillRequirementLevel.REQUIRED,
          })),
        });
      }

      // 3. Return full updated list
      return tx.opportunitySkill.findMany({
        where: { opportunityId },
        include: {
          skill: true,
        },
      });
    });
  }

  /**
   * Retrieve all skill associations for a specific opportunity.
   */
  async findSkillsByOpportunityId(
    opportunityId: string,
  ): Promise<OpportunitySkillWithSkill[]> {
    return this.prisma.opportunitySkill.findMany({
      where: { opportunityId },
      include: {
        skill: true,
      },
    });
  }

  /**
   * Retrieve published, active opportunities for matching and AI recommendations.
   * Enforces status = PUBLISHED, active application deadline, and non-deleted records.
   */
  async findPublishedForMatching(
    filters: Omit<
      OpportunityFilterOptions,
      'status' | 'includeDeleted' | 'hasActiveDeadline'
    > = {},
  ): Promise<OpportunityWithRelations[]> {
    return this.findMany({
      ...filters,
      status: OpportunityStatus.PUBLISHED,
      hasActiveDeadline: true,
      includeDeleted: false,
    });
  }

  /**
   * Helper to construct type-safe Prisma where clause based on filter options.
   */
  private buildWhereClause(
    filters: OpportunityFilterOptions,
  ): Prisma.OpportunityWhereInput {
    const where: Prisma.OpportunityWhereInput = {};
    const andConditions: Prisma.OpportunityWhereInput[] = [];

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters.opportunityType) {
      where.opportunityType = filters.opportunityType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.isRemote !== undefined) {
      where.isRemote = filters.isRemote;
    }

    if (filters.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters.eligibleFields && filters.eligibleFields.length > 0) {
      where.eligibleFields = {
        hasSome: filters.eligibleFields,
      };
    }

    if (filters.skillIds && filters.skillIds.length > 0) {
      where.skills = {
        some: {
          skillId: {
            in: filters.skillIds,
          },
        },
      };
    }

    if (filters.keyword && filters.keyword.trim().length > 0) {
      const trimmedKeyword = filters.keyword.trim();
      andConditions.push({
        OR: [
          {
            title: {
              contains: trimmedKeyword,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: trimmedKeyword,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (filters.minimumAcademicYear !== undefined) {
      andConditions.push({
        OR: [
          { minimumAcademicYear: null },
          { minimumAcademicYear: { lte: filters.minimumAcademicYear } },
        ],
      });
    }

    if (filters.maximumAcademicYear !== undefined) {
      andConditions.push({
        OR: [
          { maximumAcademicYear: null },
          { maximumAcademicYear: { gte: filters.maximumAcademicYear } },
        ],
      });
    }

    if (filters.hasActiveDeadline) {
      andConditions.push({
        OR: [
          { applicationDeadline: null },
          { applicationDeadline: { gte: new Date() } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return where;
  }
}
