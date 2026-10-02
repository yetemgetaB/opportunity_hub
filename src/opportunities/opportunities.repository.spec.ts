import { Test, TestingModule } from '@nestjs/testing';
import {
  OpportunityStatus,
  OpportunityType,
  Prisma,
  SkillRequirementLevel,
} from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { OpportunitiesRepository } from './opportunities.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('OpportunitiesRepository', () => {
  let repository: OpportunitiesRepository;
  let mockPrisma: any;

  const mockDate = new Date('2026-09-30T12:00:00Z');

  const baseOpportunity = {
    id: '11111111-1111-1111-1111-111111111111',
    organizationId: '22222222-2222-2222-2222-222222222222',
    title: 'Software Engineer Intern',
    description: 'Build high-performance web and backend services.',
    opportunityType: OpportunityType.INTERNSHIP,
    status: OpportunityStatus.DRAFT,
    location: 'Addis Ababa',
    isRemote: false,
    applicationDeadline: new Date('2026-12-31T23:59:59Z'),
    minimumAcademicYear: 3,
    maximumAcademicYear: 5,
    minimumGpa: new Prisma.Decimal('3.50'),
    eligibleFields: ['Computer Science', 'Software Engineering'],
    compensation: '$500/month',
    applicationUrl: 'https://example.com/apply',
    createdAt: mockDate,
    updatedAt: mockDate,
    publishedAt: null,
    deletedAt: null,
    organization: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Tech Corp',
    },
    skills: [],
  };

  beforeEach(async () => {
    mockPrisma = {
      opportunity: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      opportunitySkill: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<OpportunitiesRepository>(OpportunitiesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create an opportunity with draft status by default and without skills', async () => {
      const createData = {
        organizationId: '22222222-2222-2222-2222-222222222222',
        title: 'Backend Intern',
        description: 'Develop NestJS APIs',
        opportunityType: OpportunityType.INTERNSHIP,
      };

      mockPrisma.opportunity.create.mockResolvedValue({
        ...baseOpportunity,
        ...createData,
      });

      const result = await repository.create(createData);

      expect(result).toBeDefined();
      expect(mockPrisma.opportunity.create).toHaveBeenCalledWith({
        data: {
          organization: {
            connect: { id: createData.organizationId },
          },
          title: 'Backend Intern',
          description: 'Develop NestJS APIs',
          opportunityType: OpportunityType.INTERNSHIP,
          status: OpportunityStatus.DRAFT,
          location: null,
          isRemote: false,
          applicationDeadline: null,
          minimumAcademicYear: null,
          maximumAcademicYear: null,
          minimumGpa: null,
          eligibleFields: [],
          compensation: null,
          applicationUrl: null,
          publishedAt: null,
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
    });

    it('should create opportunity with initial skills and automatically set publishedAt if status is PUBLISHED', async () => {
      const createData = {
        organizationId: '22222222-2222-2222-2222-222222222222',
        title: 'Senior Researcher',
        description: 'Conduct AI research',
        opportunityType: OpportunityType.FELLOWSHIP,
        status: OpportunityStatus.PUBLISHED,
        minimumGpa: 3.8,
        skills: [
          {
            skillId: '33333333-3333-3333-3333-333333333333',
            requirementLevel: SkillRequirementLevel.REQUIRED,
          },
          {
            skillId: '44444444-4444-4444-4444-444444444444',
            requirementLevel: SkillRequirementLevel.PREFERRED,
          },
        ],
      };

      mockPrisma.opportunity.create.mockImplementation((args: any) => ({
        ...baseOpportunity,
        ...args.data,
        id: 'new-opp-id',
      }));

      const result = await repository.create(createData);

      expect(result).toBeDefined();
      expect(mockPrisma.opportunity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: OpportunityStatus.PUBLISHED,
            publishedAt: expect.any(Date),
            minimumGpa: new Prisma.Decimal(3.8),
            skills: {
              create: [
                {
                  skill: { connect: { id: '33333333-3333-3333-3333-333333333333' } },
                  requirementLevel: SkillRequirementLevel.REQUIRED,
                },
                {
                  skill: { connect: { id: '44444444-4444-4444-4444-444444444444' } },
                  requirementLevel: SkillRequirementLevel.PREFERRED,
                },
              ],
            },
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should find active opportunity by id and exclude deleted by default', async () => {
      mockPrisma.opportunity.findFirst.mockResolvedValue(baseOpportunity);

      const result = await repository.findById(baseOpportunity.id);

      expect(result).toEqual(baseOpportunity);
      expect(mockPrisma.opportunity.findFirst).toHaveBeenCalledWith({
        where: {
          id: baseOpportunity.id,
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
    });

    it('should allow including soft-deleted opportunity when explicitly requested', async () => {
      const deletedOpp = { ...baseOpportunity, deletedAt: new Date() };
      mockPrisma.opportunity.findFirst.mockResolvedValue(deletedOpp);

      const result = await repository.findById(baseOpportunity.id, {
        includeDeleted: true,
      });

      expect(result).toEqual(deletedOpp);
      expect(mockPrisma.opportunity.findFirst).toHaveBeenCalledWith({
        where: {
          id: baseOpportunity.id,
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
    });
  });

  describe('findByIdAndOrganizationId', () => {
    it('should find opportunity scoped by organization id', async () => {
      mockPrisma.opportunity.findFirst.mockResolvedValue(baseOpportunity);

      const result = await repository.findByIdAndOrganizationId(
        baseOpportunity.id,
        baseOpportunity.organizationId,
      );

      expect(result).toEqual(baseOpportunity);
      expect(mockPrisma.opportunity.findFirst).toHaveBeenCalledWith({
        where: {
          id: baseOpportunity.id,
          organizationId: baseOpportunity.organizationId,
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
    });
  });

  describe('findByOrganizationId', () => {
    it('should retrieve all active opportunities for an organization', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      const result = await repository.findByOrganizationId(
        baseOpportunity.organizationId,
        { status: OpportunityStatus.PUBLISHED, skip: 0, take: 10 },
      );

      expect(result).toEqual([baseOpportunity]);
      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: baseOpportunity.organizationId,
          deletedAt: null,
          status: OpportunityStatus.PUBLISHED,
        },
        include: {
          organization: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findMany', () => {
    it('should construct filters for discovery, matching, and search with compound AND conditions', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      const filters = {
        keyword: 'software',
        opportunityType: OpportunityType.INTERNSHIP,
        status: OpportunityStatus.PUBLISHED,
        isRemote: true,
        location: 'Addis',
        eligibleFields: ['Computer Science'],
        skillIds: ['skill-1', 'skill-2'],
        minimumAcademicYear: 3,
        maximumAcademicYear: 4,
        hasActiveDeadline: true,
      };

      const result = await repository.findMany(filters);

      expect(result).toEqual([baseOpportunity]);
      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          opportunityType: OpportunityType.INTERNSHIP,
          status: OpportunityStatus.PUBLISHED,
          isRemote: true,
          location: {
            contains: 'Addis',
            mode: 'insensitive',
          },
          eligibleFields: {
            hasSome: ['Computer Science'],
          },
          skills: {
            some: {
              skillId: {
                in: ['skill-1', 'skill-2'],
              },
            },
          },
          AND: [
            {
              OR: [
                { title: { contains: 'software', mode: 'insensitive' } },
                { description: { contains: 'software', mode: 'insensitive' } },
              ],
            },
            {
              OR: [
                { minimumAcademicYear: null },
                { minimumAcademicYear: { lte: 3 } },
              ],
            },
            {
              OR: [
                { maximumAcademicYear: null },
                { maximumAcademicYear: { gte: 4 } },
              ],
            },
            {
              OR: [
                { applicationDeadline: null },
                { applicationDeadline: { gte: expect.any(Date) } },
              ],
            },
          ],
        },
        include: {
          organization: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('should support keyword search against title and description', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      await repository.findMany({ keyword: 'engineer' });

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          AND: [
            {
              OR: [
                { title: { contains: 'engineer', mode: 'insensitive' } },
                { description: { contains: 'engineer', mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: {
          organization: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('should combine keyword search with location and opportunity type', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      await repository.findMany({
        keyword: 'NestJS',
        location: 'Bole',
        opportunityType: OpportunityType.JOB,
      });

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          opportunityType: OpportunityType.JOB,
          location: {
            contains: 'Bole',
            mode: 'insensitive',
          },
          AND: [
            {
              OR: [
                { title: { contains: 'NestJS', mode: 'insensitive' } },
                { description: { contains: 'NestJS', mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: {
          organization: true,
          skills: {
            include: {
              skill: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: undefined,
        take: undefined,
      });
    });

    it('regression: should not overwrite academic year filters when hasActiveDeadline is true', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      await repository.findMany({
        minimumAcademicYear: 2,
        maximumAcademicYear: 5,
        hasActiveDeadline: true,
      });

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: [
              {
                OR: [
                  { minimumAcademicYear: null },
                  { minimumAcademicYear: { lte: 2 } },
                ],
              },
              {
                OR: [
                  { maximumAcademicYear: null },
                  { maximumAcademicYear: { gte: 5 } },
                ],
              },
              {
                OR: [
                  { applicationDeadline: null },
                  { applicationDeadline: { gte: expect.any(Date) } },
                ],
              },
            ],
          }),
        }),
      );
    });
  });

  describe('findPublishedForMatching', () => {
    it('should enforce PUBLISHED status, active deadline, and non-deleted records', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      const result = await repository.findPublishedForMatching({
        eligibleFields: ['Computer Science'],
      });

      expect(result).toEqual([baseOpportunity]);
      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: OpportunityStatus.PUBLISHED,
            deletedAt: null,
            eligibleFields: {
              hasSome: ['Computer Science'],
            },
            AND: [
              {
                OR: [
                  { applicationDeadline: null },
                  { applicationDeadline: { gte: expect.any(Date) } },
                ],
              },
            ],
          }),
        }),
      );
    });
  });

  describe('count', () => {
    it('should return matching count', async () => {
      mockPrisma.opportunity.count.mockResolvedValue(5);

      const result = await repository.count({ status: OpportunityStatus.PUBLISHED });
      expect(result).toBe(5);
      expect(mockPrisma.opportunity.count).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          status: OpportunityStatus.PUBLISHED,
        },
      });
    });
  });

  describe('update', () => {
    it('should update active opportunity when found', async () => {
      mockPrisma.opportunity.findFirst.mockResolvedValue(baseOpportunity);
      mockPrisma.opportunity.update.mockResolvedValue({
        ...baseOpportunity,
        title: 'Updated Title',
      });

      const result = await repository.update(baseOpportunity.id, {
        title: 'Updated Title',
        minimumGpa: 3.9,
      });

      expect(result.title).toBe('Updated Title');
      expect(mockPrisma.opportunity.update).toHaveBeenCalledWith({
        where: { id: baseOpportunity.id },
        data: {
          title: 'Updated Title',
          minimumGpa: new Prisma.Decimal(3.9),
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
    });

    it('should set publishedAt if updating status to PUBLISHED from draft without previous publishedAt', async () => {
      mockPrisma.opportunity.findFirst.mockResolvedValue({
        ...baseOpportunity,
        status: OpportunityStatus.DRAFT,
        publishedAt: null,
      });
      mockPrisma.opportunity.update.mockResolvedValue({
        ...baseOpportunity,
        status: OpportunityStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      await repository.update(baseOpportunity.id, {
        status: OpportunityStatus.PUBLISHED,
      });

      expect(mockPrisma.opportunity.update).toHaveBeenCalledWith({
        where: { id: baseOpportunity.id },
        data: {
          status: OpportunityStatus.PUBLISHED,
          publishedAt: expect.any(Date),
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
    });

    it('should throw NotFoundException if opportunity is soft-deleted or not found', async () => {
      mockPrisma.opportunity.findFirst.mockResolvedValue(null);

      await expect(
        repository.update('non-existent', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should soft-delete opportunity by setting deletedAt timestamp', async () => {
      mockPrisma.opportunity.findFirst.mockResolvedValue(baseOpportunity);
      mockPrisma.opportunity.update.mockResolvedValue({
        ...baseOpportunity,
        deletedAt: new Date(),
      });

      const result = await repository.softDelete(
        baseOpportunity.id,
        baseOpportunity.organizationId,
      );

      expect(result).toBeDefined();
      expect(mockPrisma.opportunity.delete).not.toHaveBeenCalled();
      expect(mockPrisma.opportunity.update).toHaveBeenCalledWith({
        where: { id: baseOpportunity.id },
        data: {
          deletedAt: expect.any(Date),
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
    });

    it('should throw NotFoundException when trying to soft-delete non-existent opportunity', async () => {
      mockPrisma.opportunity.findFirst.mockResolvedValue(null);

      await expect(
        repository.softDelete('non-existent', 'org-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('opportunitySkills management', () => {
    it('should upsert opportunity skill with requirement level', async () => {
      const oppSkill = {
        opportunityId: baseOpportunity.id,
        skillId: 'skill-1',
        requirementLevel: SkillRequirementLevel.PREFERRED,
        skill: { id: 'skill-1', name: 'TypeScript' },
      };
      mockPrisma.opportunitySkill.upsert.mockResolvedValue(oppSkill);

      const result = await repository.addSkill(
        baseOpportunity.id,
        'skill-1',
        SkillRequirementLevel.PREFERRED,
      );

      expect(result).toEqual(oppSkill);
      expect(mockPrisma.opportunitySkill.upsert).toHaveBeenCalledWith({
        where: {
          opportunityId_skillId: {
            opportunityId: baseOpportunity.id,
            skillId: 'skill-1',
          },
        },
        create: {
          opportunityId: baseOpportunity.id,
          skillId: 'skill-1',
          requirementLevel: SkillRequirementLevel.PREFERRED,
        },
        update: {
          requirementLevel: SkillRequirementLevel.PREFERRED,
        },
        include: {
          skill: true,
        },
      });
    });

    it('should remove skill association', async () => {
      mockPrisma.opportunitySkill.deleteMany.mockResolvedValue({ count: 1 });

      await repository.removeSkill(baseOpportunity.id, 'skill-1');

      expect(mockPrisma.opportunitySkill.deleteMany).toHaveBeenCalledWith({
        where: {
          opportunityId: baseOpportunity.id,
          skillId: 'skill-1',
        },
      });
    });

    it('should replace skills atomically in a transaction', async () => {
      const skillsToSet = [
        { skillId: 's1', requirementLevel: SkillRequirementLevel.REQUIRED },
        { skillId: 's2', requirementLevel: SkillRequirementLevel.PREFERRED },
      ];

      mockPrisma.opportunitySkill.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.opportunitySkill.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.opportunitySkill.findMany.mockResolvedValue(skillsToSet);

      const result = await repository.replaceSkills(
        baseOpportunity.id,
        skillsToSet,
      );

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.opportunitySkill.deleteMany).toHaveBeenCalledWith({
        where: { opportunityId: baseOpportunity.id },
      });
      expect(mockPrisma.opportunitySkill.createMany).toHaveBeenCalledWith({
        data: [
          {
            opportunityId: baseOpportunity.id,
            skillId: 's1',
            requirementLevel: SkillRequirementLevel.REQUIRED,
          },
          {
            opportunityId: baseOpportunity.id,
            skillId: 's2',
            requirementLevel: SkillRequirementLevel.PREFERRED,
          },
        ],
      });
      expect(result).toEqual(skillsToSet);
    });

    it('should find skills by opportunity id', async () => {
      const oppSkills = [
        {
          opportunityId: baseOpportunity.id,
          skillId: 's1',
          requirementLevel: SkillRequirementLevel.REQUIRED,
          skill: { id: 's1', name: 'PostgreSQL' },
        },
      ];
      mockPrisma.opportunitySkill.findMany.mockResolvedValue(oppSkills);

      const result = await repository.findSkillsByOpportunityId(baseOpportunity.id);

      expect(result).toEqual(oppSkills);
      expect(mockPrisma.opportunitySkill.findMany).toHaveBeenCalledWith({
        where: { opportunityId: baseOpportunity.id },
        include: {
          skill: true,
        },
      });
    });
  });
});
