import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  OpportunityStatus,
  SavedOpportunity,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ApplicationWithRelations,
  SavedOpportunityWithRelations,
} from './applications.interface';
import { ApplicationsRepository } from './applications.repository';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly applicationsRepository: ApplicationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================================================
  // 1. APPLICATION OPERATIONS (Day 9 & Day 10)
  // ==========================================================================

  /**
   * Submit an application for an opportunity.
   * Validates:
   * 1. Student profile exists for user.
   * 2. Opportunity exists, is PUBLISHED, active deadline, not soft-deleted.
   * 3. No duplicate application exists.
   */
  async apply(
    studentUserId: string,
    opportunityId: string,
  ): Promise<ApplicationWithRelations> {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found.');
    }

    const opportunity = await this.prisma.opportunity.findFirst({
      where: {
        id: opportunityId,
        deletedAt: null,
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found.');
    }

    if (opportunity.status !== OpportunityStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot apply to an unpublished opportunity.',
      );
    }

    if (
      opportunity.applicationDeadline &&
      opportunity.applicationDeadline < new Date()
    ) {
      throw new BadRequestException(
        'Application deadline for this opportunity has passed.',
      );
    }

    const alreadyApplied = await this.applicationsRepository.exists(
      studentUserId,
      opportunityId,
    );

    if (alreadyApplied) {
      throw new ConflictException(
        'You have already applied for this opportunity.',
      );
    }

    return this.applicationsRepository.create({
      studentProfileId: studentUserId,
      opportunityId,
      status: ApplicationStatus.SUBMITTED,
    });
  }

  /**
   * Retrieve applications submitted by the authenticated student.
   */
  async getMyApplications(
    studentUserId: string,
    options?: {
      status?: ApplicationStatus;
      skip?: number;
      take?: number;
    },
  ): Promise<ApplicationWithRelations[]> {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found.');
    }

    return this.applicationsRepository.findByStudentProfileId(
      studentUserId,
      options,
    );
  }

  /**
   * Retrieve a specific application belonging to the authenticated student.
   */
  async getMyApplicationById(
    studentUserId: string,
    applicationId: string,
  ): Promise<ApplicationWithRelations> {
    const application =
      await this.applicationsRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException('Application not found.');
    }

    if (application.studentProfileId !== studentUserId) {
      throw new ForbiddenException(
        'Access denied: You can only view your own applications.',
      );
    }

    return application;
  }

  /**
   * Retrieve all applications submitted to the authenticated organization's opportunities.
   */
  async getOrganizationApplications(
    orgUserId: string,
    options?: {
      opportunityId?: string;
      status?: ApplicationStatus;
      skip?: number;
      take?: number;
    },
  ): Promise<ApplicationWithRelations[]> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId: orgUserId },
      include: { organization: true },
    });

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException('Organization membership not found.');
    }

    return this.applicationsRepository.findByOrganizationId(
      membership.organizationId,
      options,
    );
  }

  /**
   * Update the status of an application for an organization's opportunity.
   */
  async updateApplicationStatus(
    orgUserId: string,
    applicationId: string,
    newStatus: ApplicationStatus,
  ): Promise<ApplicationWithRelations> {
    const membership = await this.prisma.organizationMember.findFirst({
      where: { userId: orgUserId },
      include: { organization: true },
    });

    if (!membership || membership.organization.deletedAt) {
      throw new NotFoundException('Organization membership not found.');
    }

    const application =
      await this.applicationsRepository.findById(applicationId);

    if (!application) {
      throw new NotFoundException('Application not found.');
    }

    if (application.opportunity.organizationId !== membership.organizationId) {
      throw new ForbiddenException(
        'Access denied: You can only update applications for your own organization.',
      );
    }

    return this.applicationsRepository.updateStatus(applicationId, newStatus);
  }

  // ==========================================================================
  // 2. SAVED OPPORTUNITY OPERATIONS (Day 9)
  // ==========================================================================

  /**
   * Bookmark an opportunity for the authenticated student.
   */
  async saveOpportunity(
    studentUserId: string,
    opportunityId: string,
  ): Promise<SavedOpportunity> {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found.');
    }

    const opportunity = await this.prisma.opportunity.findFirst({
      where: {
        id: opportunityId,
        deletedAt: null,
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found.');
    }

    return this.applicationsRepository.saveOpportunity(
      studentUserId,
      opportunityId,
    );
  }

  /**
   * Remove a bookmarked opportunity for the authenticated student.
   */
  async removeSavedOpportunity(
    studentUserId: string,
    opportunityId: string,
  ): Promise<{ message: string }> {
    await this.applicationsRepository.removeSavedOpportunity(
      studentUserId,
      opportunityId,
    );

    return {
      message: 'Opportunity removed from saved list.',
    };
  }

  /**
   * Retrieve all bookmarked opportunities for the authenticated student.
   */
  async getMySavedOpportunities(
    studentUserId: string,
    options?: {
      skip?: number;
      take?: number;
    },
  ): Promise<SavedOpportunityWithRelations[]> {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });

    if (!student) {
      throw new NotFoundException('Student profile not found.');
    }

    return this.applicationsRepository.findSavedByStudentProfileId(
      studentUserId,
      options,
    );
  }

  /**
   * Check whether an opportunity is saved by the authenticated student.
   */
  async isOpportunitySaved(
    studentUserId: string,
    opportunityId: string,
  ): Promise<boolean> {
    return this.applicationsRepository.isOpportunitySaved(
      studentUserId,
      opportunityId,
    );
  }
}
