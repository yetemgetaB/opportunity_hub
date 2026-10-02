import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { ApplicationsRepository } from './applications.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('ApplicationsRepository', () => {
  let repository: ApplicationsRepository;
  let mockPrisma: any;

  const mockDate = new Date('2026-10-02T12:00:00Z');

  const baseApplication = {
    id: 'app-1111-1111-1111-111111111111',
    studentProfileId: 'student-2222-2222-2222-222222222222',
    opportunityId: 'opp-3333-3333-3333-333333333333',
    status: ApplicationStatus.SUBMITTED,
    appliedAt: mockDate,
    updatedAt: mockDate,
    studentProfile: {
      userId: 'student-2222-2222-2222-222222222222',
      academicYear: 3,
      university: 'Addis Ababa University',
      fieldOfStudy: 'Software Engineering',
      user: {
        id: 'student-2222-2222-2222-222222222222',
        firstName: 'Abebe',
        lastName: 'Kebede',
      },
      skills: [],
    },
    opportunity: {
      id: 'opp-3333-3333-3333-333333333333',
      organizationId: 'org-4444-4444-4444-444444444444',
      title: 'Backend Engineer Intern',
      organization: {
        id: 'org-4444-4444-4444-444444444444',
        name: 'Tech Corp',
      },
      skills: [],
    },
    assessmentAttempt: null,
  };

  const baseSavedOpportunity = {
    studentProfileId: 'student-2222-2222-2222-222222222222',
    opportunityId: 'opp-3333-3333-3333-333333333333',
    savedAt: mockDate,
    opportunity: {
      id: 'opp-3333-3333-3333-333333333333',
      title: 'Backend Engineer Intern',
      organization: {
        id: 'org-4444-4444-4444-444444444444',
        name: 'Tech Corp',
      },
      skills: [],
    },
    studentProfile: {
      userId: 'student-2222-2222-2222-222222222222',
      user: {
        id: 'student-2222-2222-2222-222222222222',
        firstName: 'Abebe',
      },
    },
  };

  beforeEach(async () => {
    mockPrisma = {
      application: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      savedOpportunity: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<ApplicationsRepository>(ApplicationsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // ==========================================================================
  // 1. APPLICATION DATA ACCESS TESTS
  // ==========================================================================

  describe('create', () => {
    it('should create an application with default status SUBMITTED', async () => {
      mockPrisma.application.create.mockResolvedValue(baseApplication);

      const result = await repository.create({
        studentProfileId: 'student-2222-2222-2222-222222222222',
        opportunityId: 'opp-3333-3333-3333-333333333333',
      });

      expect(result).toEqual(baseApplication);
      expect(mockPrisma.application.create).toHaveBeenCalledWith({
        data: {
          studentProfileId: 'student-2222-2222-2222-222222222222',
          opportunityId: 'opp-3333-3333-3333-333333333333',
          status: ApplicationStatus.SUBMITTED,
        },
        include: expect.any(Object),
      });
    });

    it('should throw ConflictException on Prisma unique constraint error (P2002)', async () => {
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        {
          code: 'P2002',
          clientVersion: '5.10.2',
        },
      );
      mockPrisma.application.create.mockRejectedValue(p2002Error);

      await expect(
        repository.create({
          studentProfileId: 'student-2222-2222-2222-222222222222',
          opportunityId: 'opp-3333-3333-3333-333333333333',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should find application by id with full relation graph', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(baseApplication);

      const result = await repository.findById(baseApplication.id);

      expect(result).toEqual(baseApplication);
      expect(mockPrisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: baseApplication.id },
        include: expect.objectContaining({
          studentProfile: expect.any(Object),
          opportunity: expect.any(Object),
          assessmentAttempt: true,
        }),
      });
    });
  });

  describe('findByStudentAndOpportunity', () => {
    it('should look up application using composite unique key', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(baseApplication);

      const result = await repository.findByStudentAndOpportunity(
        baseApplication.studentProfileId,
        baseApplication.opportunityId,
      );

      expect(result).toEqual(baseApplication);
      expect(mockPrisma.application.findUnique).toHaveBeenCalledWith({
        where: {
          studentProfileId_opportunityId: {
            studentProfileId: baseApplication.studentProfileId,
            opportunityId: baseApplication.opportunityId,
          },
        },
        include: expect.any(Object),
      });
    });
  });

  describe('findByStudentProfileId', () => {
    it('should retrieve student applications sorted by appliedAt desc', async () => {
      mockPrisma.application.findMany.mockResolvedValue([baseApplication]);

      const result = await repository.findByStudentProfileId(
        baseApplication.studentProfileId,
        { status: ApplicationStatus.UNDER_REVIEW, skip: 0, take: 10 },
      );

      expect(result).toEqual([baseApplication]);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: {
          studentProfileId: baseApplication.studentProfileId,
          status: ApplicationStatus.UNDER_REVIEW,
        },
        include: expect.any(Object),
        orderBy: { appliedAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findByOpportunityId', () => {
    it('should retrieve applications for specific opportunity', async () => {
      mockPrisma.application.findMany.mockResolvedValue([baseApplication]);

      const result = await repository.findByOpportunityId(
        baseApplication.opportunityId,
      );

      expect(result).toEqual([baseApplication]);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: {
          opportunityId: baseApplication.opportunityId,
        },
        include: expect.any(Object),
        orderBy: { appliedAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });
  });

  describe('findByOrganizationId', () => {
    it('should retrieve applications belonging to organization opportunities', async () => {
      mockPrisma.application.findMany.mockResolvedValue([baseApplication]);

      const result = await repository.findByOrganizationId(
        'org-4444-4444-4444-444444444444',
        { status: ApplicationStatus.SHORTLISTED },
      );

      expect(result).toEqual([baseApplication]);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: {
          opportunity: {
            organizationId: 'org-4444-4444-4444-444444444444',
            deletedAt: null,
          },
          status: ApplicationStatus.SHORTLISTED,
        },
        include: expect.any(Object),
        orderBy: { appliedAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });
  });

  describe('findMany and count', () => {
    it('should filter applications and count accurately', async () => {
      mockPrisma.application.findMany.mockResolvedValue([baseApplication]);
      mockPrisma.application.count.mockResolvedValue(1);

      const filters = {
        studentProfileId: baseApplication.studentProfileId,
        status: ApplicationStatus.SUBMITTED,
      };

      const items = await repository.findMany(filters);
      const total = await repository.count(filters);

      expect(items).toEqual([baseApplication]);
      expect(total).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('should update application status and return full relation graph', async () => {
      const updated = {
        ...baseApplication,
        status: ApplicationStatus.ACCEPTED,
      };
      mockPrisma.application.findUnique.mockResolvedValue(baseApplication);
      mockPrisma.application.update.mockResolvedValue(updated);

      const result = await repository.updateStatus(
        baseApplication.id,
        ApplicationStatus.ACCEPTED,
      );

      expect(result.status).toBe(ApplicationStatus.ACCEPTED);
      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: baseApplication.id },
        data: { status: ApplicationStatus.ACCEPTED },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        repository.updateStatus('non-existent', ApplicationStatus.REJECTED),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('exists', () => {
    it('should return true if application exists', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({ id: 'app-1' });

      const result = await repository.exists(
        baseApplication.studentProfileId,
        baseApplication.opportunityId,
      );

      expect(result).toBe(true);
    });

    it('should return false if application does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      const result = await repository.exists(
        baseApplication.studentProfileId,
        baseApplication.opportunityId,
      );

      expect(result).toBe(false);
    });
  });

  // ==========================================================================
  // 2. SAVED OPPORTUNITY DATA ACCESS TESTS
  // ==========================================================================

  describe('saveOpportunity', () => {
    it('should upsert saved opportunity record for student', async () => {
      mockPrisma.savedOpportunity.upsert.mockResolvedValue(baseSavedOpportunity);

      const result = await repository.saveOpportunity(
        baseSavedOpportunity.studentProfileId,
        baseSavedOpportunity.opportunityId,
      );

      expect(result).toEqual(baseSavedOpportunity);
      expect(mockPrisma.savedOpportunity.upsert).toHaveBeenCalledWith({
        where: {
          studentProfileId_opportunityId: {
            studentProfileId: baseSavedOpportunity.studentProfileId,
            opportunityId: baseSavedOpportunity.opportunityId,
          },
        },
        create: {
          studentProfileId: baseSavedOpportunity.studentProfileId,
          opportunityId: baseSavedOpportunity.opportunityId,
        },
        update: {
          savedAt: expect.any(Date),
        },
      });
    });
  });

  describe('removeSavedOpportunity', () => {
    it('should delete saved opportunity record', async () => {
      mockPrisma.savedOpportunity.deleteMany.mockResolvedValue({ count: 1 });

      await repository.removeSavedOpportunity(
        baseSavedOpportunity.studentProfileId,
        baseSavedOpportunity.opportunityId,
      );

      expect(mockPrisma.savedOpportunity.deleteMany).toHaveBeenCalledWith({
        where: {
          studentProfileId: baseSavedOpportunity.studentProfileId,
          opportunityId: baseSavedOpportunity.opportunityId,
        },
      });
    });
  });

  describe('isOpportunitySaved', () => {
    it('should return true if opportunity is bookmarked', async () => {
      mockPrisma.savedOpportunity.findUnique.mockResolvedValue({
        studentProfileId: baseSavedOpportunity.studentProfileId,
      });

      const result = await repository.isOpportunitySaved(
        baseSavedOpportunity.studentProfileId,
        baseSavedOpportunity.opportunityId,
      );

      expect(result).toBe(true);
    });

    it('should return false if opportunity is not bookmarked', async () => {
      mockPrisma.savedOpportunity.findUnique.mockResolvedValue(null);

      const result = await repository.isOpportunitySaved(
        baseSavedOpportunity.studentProfileId,
        baseSavedOpportunity.opportunityId,
      );

      expect(result).toBe(false);
    });
  });

  describe('findSavedByStudentProfileId and countSaved', () => {
    it('should retrieve saved opportunities with opportunity and organization details', async () => {
      mockPrisma.savedOpportunity.findMany.mockResolvedValue([
        baseSavedOpportunity,
      ]);
      mockPrisma.savedOpportunity.count.mockResolvedValue(1);

      const items = await repository.findSavedByStudentProfileId(
        baseSavedOpportunity.studentProfileId,
        { skip: 0, take: 5 },
      );
      const total = await repository.countSaved(
        baseSavedOpportunity.studentProfileId,
      );

      expect(items).toEqual([baseSavedOpportunity]);
      expect(total).toBe(1);
      expect(mockPrisma.savedOpportunity.findMany).toHaveBeenCalledWith({
        where: {
          studentProfileId: baseSavedOpportunity.studentProfileId,
          opportunity: {
            deletedAt: null,
          },
        },
        include: expect.any(Object),
        orderBy: { savedAt: 'desc' },
        skip: 0,
        take: 5,
      });
    });
  });
});
