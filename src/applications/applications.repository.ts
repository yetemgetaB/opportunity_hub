import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, Prisma, SavedOpportunity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApplicationFilterOptions,
  ApplicationWithRelations,
  CreateApplicationData,
  SavedOpportunityWithRelations,
} from './applications.interface';

@Injectable()
export class ApplicationsRepository {
  private readonly logger = new Logger(ApplicationsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Common relation include object for applications.
   * Traverses Student -> Application -> Opportunity -> Organization.
   */
  private readonly defaultApplicationIncludes = {
    studentProfile: {
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    },
    opportunity: {
      include: {
        organization: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    },
    assessmentAttempt: true,
  } as const;

  /**
   * Common relation include object for saved opportunities.
   */
  private readonly defaultSavedIncludes = {
    opportunity: {
      include: {
        organization: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    },
    studentProfile: {
      include: {
        user: true,
      },
    },
  } as const;

  // ==========================================================================
  // 1. APPLICATION DATA ACCESS (Day 9 & Day 10)
  // ==========================================================================

  /**
   * Create a new formal student application.
   * Enforces status SUBMITTED by default and catches duplicate application errors.
   */
  async create(data: CreateApplicationData): Promise<ApplicationWithRelations> {
    try {
      const application = await this.prisma.application.create({
        data: {
          studentProfileId: data.studentProfileId,
          opportunityId: data.opportunityId,
          status: data.status ?? ApplicationStatus.SUBMITTED,
        },
        include: this.defaultApplicationIncludes,
      });

      this.logger.log(
        `Created application ${application.id} for student ${data.studentProfileId} on opportunity ${data.opportunityId}`,
      );

      return application;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Duplicate application: Student has already submitted an application for this opportunity.',
          );
        }
      }
      throw error;
    }
  }

  /**
   * Look up an application by its unique primary key UUID.
   */
  async findById(id: string): Promise<ApplicationWithRelations | null> {
    return this.prisma.application.findUnique({
      where: { id },
      include: this.defaultApplicationIncludes,
    });
  }

  /**
   * Look up an application by student and opportunity composite uniqueness.
   */
  async findByStudentAndOpportunity(
    studentProfileId: string,
    opportunityId: string,
  ): Promise<ApplicationWithRelations | null> {
    return this.prisma.application.findUnique({
      where: {
        studentProfileId_opportunityId: {
          studentProfileId,
          opportunityId,
        },
      },
      include: this.defaultApplicationIncludes,
    });
  }

  /**
   * Retrieve all applications submitted by a specific student.
   */
  async findByStudentProfileId(
    studentProfileId: string,
    options?: {
      status?: ApplicationStatus;
      skip?: number;
      take?: number;
    },
  ): Promise<ApplicationWithRelations[]> {
    const where: Prisma.ApplicationWhereInput = {
      studentProfileId,
    };

    if (options?.status) {
      where.status = options.status;
    }

    return this.prisma.application.findMany({
      where,
      include: this.defaultApplicationIncludes,
      orderBy: { appliedAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Retrieve all applications for a specific opportunity (recruiter view).
   */
  async findByOpportunityId(
    opportunityId: string,
    options?: {
      status?: ApplicationStatus;
      skip?: number;
      take?: number;
    },
  ): Promise<ApplicationWithRelations[]> {
    const where: Prisma.ApplicationWhereInput = {
      opportunityId,
    };

    if (options?.status) {
      where.status = options.status;
    }

    return this.prisma.application.findMany({
      where,
      include: this.defaultApplicationIncludes,
      orderBy: { appliedAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Retrieve all applications belonging to an organization's opportunities.
   * Traverses Application -> Opportunity -> Organization.
   */
  async findByOrganizationId(
    organizationId: string,
    options?: {
      opportunityId?: string;
      status?: ApplicationStatus;
      skip?: number;
      take?: number;
    },
  ): Promise<ApplicationWithRelations[]> {
    const where: Prisma.ApplicationWhereInput = {
      opportunity: {
        organizationId,
        deletedAt: null,
      },
    };

    if (options?.opportunityId) {
      where.opportunityId = options.opportunityId;
    }

    if (options?.status) {
      where.status = options.status;
    }

    return this.prisma.application.findMany({
      where,
      include: this.defaultApplicationIncludes,
      orderBy: { appliedAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Retrieve applications with structured filtering.
   */
  async findMany(
    filters: ApplicationFilterOptions = {},
  ): Promise<ApplicationWithRelations[]> {
    const where: Prisma.ApplicationWhereInput = {};

    if (filters.studentProfileId) {
      where.studentProfileId = filters.studentProfileId;
    }

    if (filters.opportunityId) {
      where.opportunityId = filters.opportunityId;
    }

    if (filters.organizationId) {
      where.opportunity = {
        organizationId: filters.organizationId,
        deletedAt: null,
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return this.prisma.application.findMany({
      where,
      include: this.defaultApplicationIncludes,
      orderBy: filters.orderBy ?? { appliedAt: 'desc' },
      skip: filters.skip,
      take: filters.take,
    });
  }

  /**
   * Count total applications matching given filters.
   */
  async count(filters: ApplicationFilterOptions = {}): Promise<number> {
    const where: Prisma.ApplicationWhereInput = {};

    if (filters.studentProfileId) {
      where.studentProfileId = filters.studentProfileId;
    }

    if (filters.opportunityId) {
      where.opportunityId = filters.opportunityId;
    }

    if (filters.organizationId) {
      where.opportunity = {
        organizationId: filters.organizationId,
        deletedAt: null,
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return this.prisma.application.count({ where });
  }

  /**
   * Update the status of an existing application.
   */
  async updateStatus(
    id: string,
    status: ApplicationStatus,
  ): Promise<ApplicationWithRelations> {
    const existing = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Application with ID ${id} not found.`);
    }

    return this.prisma.application.update({
      where: { id },
      data: {
        status,
      },
      include: this.defaultApplicationIncludes,
    });
  }

  /**
   * Check whether an application exists for the student and opportunity.
   */
  async exists(
    studentProfileId: string,
    opportunityId: string,
  ): Promise<boolean> {
    const app = await this.prisma.application.findUnique({
      where: {
        studentProfileId_opportunityId: {
          studentProfileId,
          opportunityId,
        },
      },
      select: { id: true },
    });

    return !!app;
  }

  // ==========================================================================
  // 2. SAVED OPPORTUNITY DATA ACCESS (Day 9)
  // ==========================================================================

  /**
   * Save / bookmark an opportunity for a student.
   * Handles duplicate saves gracefully via upsert.
   */
  async saveOpportunity(
    studentProfileId: string,
    opportunityId: string,
  ): Promise<SavedOpportunity> {
    return this.prisma.savedOpportunity.upsert({
      where: {
        studentProfileId_opportunityId: {
          studentProfileId,
          opportunityId,
        },
      },
      create: {
        studentProfileId,
        opportunityId,
      },
      update: {
        savedAt: new Date(),
      },
    });
  }

  /**
   * Remove a saved opportunity bookmark for a student.
   */
  async removeSavedOpportunity(
    studentProfileId: string,
    opportunityId: string,
  ): Promise<void> {
    await this.prisma.savedOpportunity.deleteMany({
      where: {
        studentProfileId,
        opportunityId,
      },
    });
  }

  /**
   * Check whether a specific opportunity is bookmarked by a student.
   */
  async isOpportunitySaved(
    studentProfileId: string,
    opportunityId: string,
  ): Promise<boolean> {
    const saved = await this.prisma.savedOpportunity.findUnique({
      where: {
        studentProfileId_opportunityId: {
          studentProfileId,
          opportunityId,
        },
      },
      select: { studentProfileId: true },
    });

    return !!saved;
  }

  /**
   * Retrieve all saved opportunities for a student with opportunity and organization details.
   */
  async findSavedByStudentProfileId(
    studentProfileId: string,
    options?: {
      skip?: number;
      take?: number;
    },
  ): Promise<SavedOpportunityWithRelations[]> {
    return this.prisma.savedOpportunity.findMany({
      where: {
        studentProfileId,
        opportunity: {
          deletedAt: null,
        },
      },
      include: this.defaultSavedIncludes,
      orderBy: { savedAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Count total saved opportunities for a student.
   */
  async countSaved(studentProfileId: string): Promise<number> {
    return this.prisma.savedOpportunity.count({
      where: {
        studentProfileId,
        opportunity: {
          deletedAt: null,
        },
      },
    });
  }
}
