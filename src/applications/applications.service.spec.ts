import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, OpportunityStatus } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import { ApplicationsRepository } from './applications.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByStudentAndOpportunity: jest.fn(),
    findByStudentProfileId: jest.fn(),
    findByOpportunityId: jest.fn(),
    findByOrganizationId: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    updateStatus: jest.fn(),
    exists: jest.fn(),
    saveOpportunity: jest.fn(),
    removeSavedOpportunity: jest.fn(),
    isOpportunitySaved: jest.fn(),
    findSavedByStudentProfileId: jest.fn(),
    countSaved: jest.fn(),
  };

  const mockPrisma = {
    studentProfile: {
      findUnique: jest.fn(),
    },
    opportunity: {
      findFirst: jest.fn(),
    },
    organizationMember: {
      findFirst: jest.fn(),
    },
  };

  const studentUserId = 'student-1111-1111-1111-111111111111';
  const orgUserId = 'org-user-2222-2222-2222-222222222222';
  const orgId = 'org-3333-3333-3333-333333333333';
  const oppId = 'opp-4444-4444-4444-444444444444';
  const appId = 'app-5555-5555-5555-555555555555';

  const mockStudentProfile = {
    userId: studentUserId,
    academicYear: 3,
    university: 'AAU',
    fieldOfStudy: 'Computer Science',
  };

  const mockOpportunity = {
    id: oppId,
    organizationId: orgId,
    title: 'Software Engineer Intern',
    status: OpportunityStatus.PUBLISHED,
    applicationDeadline: new Date(Date.now() + 86400000), // tomorrow
    deletedAt: null,
  };

  const mockApplication = {
    id: appId,
    studentProfileId: studentUserId,
    opportunityId: oppId,
    status: ApplicationStatus.SUBMITTED,
    opportunity: {
      id: oppId,
      organizationId: orgId,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: ApplicationsRepository,
          useValue: mockRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================================================
  // 1. APPLICATION OPERATIONS
  // ==========================================================================

  describe('apply', () => {
    it('should submit application successfully', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockStudentProfile);
      mockPrisma.opportunity.findFirst.mockResolvedValue(mockOpportunity);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(mockApplication);

      const result = await service.apply(studentUserId, oppId);

      expect(mockPrisma.studentProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: studentUserId },
      });
      expect(mockPrisma.opportunity.findFirst).toHaveBeenCalledWith({
        where: { id: oppId, deletedAt: null },
      });
      expect(mockRepository.exists).toHaveBeenCalledWith(studentUserId, oppId);
      expect(mockRepository.create).toHaveBeenCalledWith({
        studentProfileId: studentUserId,
        opportunityId: oppId,
        status: ApplicationStatus.SUBMITTED,
      });
      expect(result).toEqual(mockApplication);
    });

    it('should throw NotFoundException if student profile does not exist', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(null);

      await expect(service.apply(studentUserId, oppId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if opportunity does not exist or is soft-deleted', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockStudentProfile);
      mockPrisma.opportunity.findFirst.mockResolvedValue(null);

      await expect(service.apply(studentUserId, oppId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if opportunity is not PUBLISHED', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockStudentProfile);
      mockPrisma.opportunity.findFirst.mockResolvedValue({
        ...mockOpportunity,
        status: OpportunityStatus.DRAFT,
      });

      await expect(service.apply(studentUserId, oppId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if application deadline has passed', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockStudentProfile);
      mockPrisma.opportunity.findFirst.mockResolvedValue({
        ...mockOpportunity,
        applicationDeadline: new Date(Date.now() - 86400000), // yesterday
      });

      await expect(service.apply(studentUserId, oppId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if student already applied for opportunity', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockStudentProfile);
      mockPrisma.opportunity.findFirst.mockResolvedValue(mockOpportunity);
      mockRepository.exists.mockResolvedValue(true);

      await expect(service.apply(studentUserId, oppId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getMyApplications', () => {
    it('should return applications for student', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockStudentProfile);
      mockRepository.findByStudentProfileId.mockResolvedValue([mockApplication]);

      const result = await service.getMyApplications(studentUserId);

      expect(mockRepository.findByStudentProfileId).toHaveBeenCalledWith(
        studentUserId,
        undefined,
      );
      expect(result).toEqual([mockApplication]);
    });

    it('should return empty array if student profile does not exist', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(null);

      const result = await service.getMyApplications(studentUserId);
      expect(result).toEqual([]);
    });
  });

  describe('getMyApplicationById', () => {
    it('should return specific application if owned by student', async () => {
      mockRepository.findById.mockResolvedValue(mockApplication);

      const result = await service.getMyApplicationById(studentUserId, appId);

      expect(result).toEqual(mockApplication);
    });

    it('should throw NotFoundException if application not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.getMyApplicationById(studentUserId, appId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if application belongs to different student', async () => {
      mockRepository.findById.mockResolvedValue({
        ...mockApplication,
        studentProfileId: 'other-student-id',
      });

      await expect(
        service.getMyApplicationById(studentUserId, appId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getOrganizationApplications', () => {
    it('should retrieve applications for organization member', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue({
        userId: orgUserId,
        organizationId: orgId,
        organization: { id: orgId, deletedAt: null },
      });
      mockRepository.findByOrganizationId.mockResolvedValue([mockApplication]);

      const result = await service.getOrganizationApplications(orgUserId);

      expect(mockRepository.findByOrganizationId).toHaveBeenCalledWith(
        orgId,
        undefined,
      );
      expect(result).toEqual([mockApplication]);
    });

    it('should throw NotFoundException if organization membership not found', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(null);

      await expect(
        service.getOrganizationApplications(orgUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateApplicationStatus', () => {
    it('should update application status when organization owns opportunity', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue({
        userId: orgUserId,
        organizationId: orgId,
        organization: { id: orgId, deletedAt: null },
      });
      mockRepository.findById.mockResolvedValue(mockApplication);
      const updatedApp = {
        ...mockApplication,
        status: ApplicationStatus.SHORTLISTED,
      };
      mockRepository.updateStatus.mockResolvedValue(updatedApp);

      const result = await service.updateApplicationStatus(
        orgUserId,
        appId,
        ApplicationStatus.SHORTLISTED,
      );

      expect(mockRepository.updateStatus).toHaveBeenCalledWith(
        appId,
        ApplicationStatus.SHORTLISTED,
      );
      expect(result.status).toEqual(ApplicationStatus.SHORTLISTED);
    });

    it('should throw ForbiddenException if organization does not own opportunity', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue({
        userId: orgUserId,
        organizationId: 'different-org-id',
        organization: { id: 'different-org-id', deletedAt: null },
      });
      mockRepository.findById.mockResolvedValue(mockApplication);

      await expect(
        service.updateApplicationStatus(
          orgUserId,
          appId,
          ApplicationStatus.ACCEPTED,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ==========================================================================
  // 2. SAVED OPPORTUNITY OPERATIONS
  // ==========================================================================

  describe('saveOpportunity', () => {
    it('should bookmark opportunity for student', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockStudentProfile);
      mockPrisma.opportunity.findFirst.mockResolvedValue(mockOpportunity);
      const mockSaved = { studentProfileId: studentUserId, opportunityId: oppId };
      mockRepository.saveOpportunity.mockResolvedValue(mockSaved);

      const result = await service.saveOpportunity(studentUserId, oppId);

      expect(mockRepository.saveOpportunity).toHaveBeenCalledWith(
        studentUserId,
        oppId,
      );
      expect(result).toEqual(mockSaved);
    });
  });

  describe('removeSavedOpportunity', () => {
    it('should remove bookmark and return success message', async () => {
      mockRepository.removeSavedOpportunity.mockResolvedValue(undefined);

      const result = await service.removeSavedOpportunity(
        studentUserId,
        oppId,
      );

      expect(mockRepository.removeSavedOpportunity).toHaveBeenCalledWith(
        studentUserId,
        oppId,
      );
      expect(result).toEqual({
        message: 'Opportunity removed from saved list.',
      });
    });
  });

  describe('getMySavedOpportunities', () => {
    it('should return saved opportunities for student', async () => {
      mockPrisma.studentProfile.findUnique.mockResolvedValue(mockStudentProfile);
      const mockSavedList = [
        { studentProfileId: studentUserId, opportunityId: oppId },
      ];
      mockRepository.findSavedByStudentProfileId.mockResolvedValue(mockSavedList);

      const result = await service.getMySavedOpportunities(studentUserId);

      expect(mockRepository.findSavedByStudentProfileId).toHaveBeenCalledWith(
        studentUserId,
        undefined,
      );
      expect(result).toEqual(mockSavedList);
    });
  });

  describe('isOpportunitySaved', () => {
    it('should return boolean indicating saved state', async () => {
      mockRepository.isOpportunitySaved.mockResolvedValue(true);

      const result = await service.isOpportunitySaved(studentUserId, oppId);

      expect(result).toBe(true);
    });
  });
});
