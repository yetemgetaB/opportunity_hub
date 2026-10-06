import { OpportunityStatus, OpportunityType } from '@prisma/client';
import { OpportunitiesRepository } from './opportunities.repository';
import { OpportunitiesService } from './opportunities.service';
import { SearchOpportunityDto } from './dto/search-opportunity.dto';

describe('Voice Search & Structured Query Data Access (Backend 2 Day 14)', () => {
  let repository: OpportunitiesRepository;
  let service: OpportunitiesService;
  let mockPrisma: any;

  const baseOpportunity = {
    id: 'opp-1111-1111-1111-111111111111',
    organizationId: 'org-1111-1111-1111-111111111111',
    title: 'AI Engineering Intern',
    description: 'Build cutting edge generative AI models and backend services',
    opportunityType: OpportunityType.INTERNSHIP,
    status: OpportunityStatus.PUBLISHED,
    location: 'Remote',
    isRemote: true,
    applicationDeadline: new Date(Date.now() + 86400000 * 30), // 30 days in future
    minimumAcademicYear: 2,
    maximumAcademicYear: 4,
    minimumGpa: null,
    eligibleFields: ['Computer Science', 'Software Engineering'],
    compensation: 'Paid',
    applicationUrl: null,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    organization: {
      id: 'org-1111-1111-1111-111111111111',
      name: 'Tech Labs',
    },
    skills: [
      {
        skillId: 'skill-python-uuid',
        requirementLevel: 'REQUIRED',
        skill: {
          id: 'skill-python-uuid',
          name: 'Python',
          category: 'Programming',
          description: 'Python 3',
        },
      },
    ],
  };

  beforeEach(() => {
    mockPrisma = {
      opportunity: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      studentProfile: {
        findUnique: jest.fn(),
      },
      organizationMember: {
        findFirst: jest.fn(),
      },
    };

    repository = new OpportunitiesRepository(mockPrisma);
    service = new OpportunitiesService(repository, mockPrisma);
  });

  describe('Repository buildWhereClause & findMany filters', () => {
    it('1. should filter by isRemote = true', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      await repository.findMany({
        isRemote: true,
        status: OpportunityStatus.PUBLISHED,
      });

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRemote: true,
            status: OpportunityStatus.PUBLISHED,
            deletedAt: null,
          }),
        }),
      );
    });

    it('2. should filter academicYear against minimumAcademicYear and maximumAcademicYear bounds', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      await repository.findMany({
        minimumAcademicYear: 3,
        maximumAcademicYear: 3,
        status: OpportunityStatus.PUBLISHED,
      });

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: OpportunityStatus.PUBLISHED,
            deletedAt: null,
            AND: expect.arrayContaining([
              {
                OR: [
                  { minimumAcademicYear: null },
                  { minimumAcademicYear: { lte: 3 } },
                ],
              },
              {
                OR: [
                  { maximumAcademicYear: null },
                  { maximumAcademicYear: { gte: 3 } },
                ],
              },
            ]),
          }),
        }),
      );
    });

    it('3. should support skillNames case-insensitively in buildWhereClause', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      await repository.findMany({
        skillNames: ['Python', 'AI'],
      });

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            skills: {
              some: {
                skill: {
                  name: {
                    in: ['Python', 'AI'],
                    mode: 'insensitive',
                  },
                },
              },
            },
          }),
        }),
      );
    });

    it('4. should exclude unpublished, soft-deleted, and expired opportunities when hasActiveDeadline and status = PUBLISHED', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([]);

      await repository.findMany({
        status: OpportunityStatus.PUBLISHED,
        hasActiveDeadline: true,
        includeDeleted: false,
      });

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: OpportunityStatus.PUBLISHED,
            deletedAt: null,
            AND: expect.arrayContaining([
              {
                OR: [
                  { applicationDeadline: null },
                  { applicationDeadline: { gte: expect.any(Date) } },
                ],
              },
            ]),
          }),
        }),
      );
    });
  });

  describe('Service searchOpportunities with voice-derived query', () => {
    it('should map natural language query "remote AI internships for third-year computer science students"', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);

      const voiceDerivedQuery: SearchOpportunityDto = {
        keyword: 'AI',
        type: OpportunityType.INTERNSHIP,
        isRemote: true,
        field: 'computer science',
        academicYear: 3,
        skillNames: ['Python'],
      };

      const result = await service.searchOpportunities(voiceDerivedQuery);

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRemote: true,
            status: OpportunityStatus.PUBLISHED,
            opportunityType: OpportunityType.INTERNSHIP,
            deletedAt: null,
            eligibleFields: {
              hasSome: expect.arrayContaining(['computer science', 'Computer Science']),
            },
            skills: {
              some: {
                skill: {
                  name: {
                    in: ['Python'],
                    mode: 'insensitive',
                  },
                },
              },
            },
            AND: expect.arrayContaining([
              {
                OR: [
                  { title: { contains: 'AI', mode: 'insensitive' } },
                  { description: { contains: 'AI', mode: 'insensitive' } },
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
                  { maximumAcademicYear: { gte: 3 } },
                ],
              },
              {
                OR: [
                  { applicationDeadline: null },
                  { applicationDeadline: { gte: expect.any(Date) } },
                ],
              },
            ]),
          }),
        }),
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: baseOpportunity.id,
        title: baseOpportunity.title,
        isRemote: true,
        skills: ['Python'],
      });
    });

    it('should seamlessly enrich search with student profile context when academicYear or field are omitted', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);
      mockPrisma.studentProfile.findUnique.mockResolvedValue({
        academicYear: 3,
        fieldOfStudy: 'Computer Science',
      });

      const genericVoiceQuery: SearchOpportunityDto = {
        keyword: 'internship',
        isRemote: true,
      };

      const studentUserId = 'student-usr-9999';
      await service.searchOpportunities(genericVoiceQuery, studentUserId);

      expect(mockPrisma.studentProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: studentUserId },
        select: { academicYear: true, fieldOfStudy: true },
      });

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRemote: true,
            status: OpportunityStatus.PUBLISHED,
            eligibleFields: {
              hasSome: expect.arrayContaining(['Computer Science']),
            },
            AND: expect.arrayContaining([
              {
                OR: [
                  { minimumAcademicYear: null },
                  { minimumAcademicYear: { lte: 3 } },
                ],
              },
              {
                OR: [
                  { maximumAcademicYear: null },
                  { maximumAcademicYear: { gte: 3 } },
                ],
              },
            ]),
          }),
        }),
      );
    });

    it('should NOT overwrite explicit query academicYear or field with student profile context', async () => {
      mockPrisma.opportunity.findMany.mockResolvedValue([baseOpportunity]);
      mockPrisma.studentProfile.findUnique.mockResolvedValue({
        academicYear: 1,
        fieldOfStudy: 'Economics',
      });

      const explicitVoiceQuery: SearchOpportunityDto = {
        keyword: 'AI',
        academicYear: 4,
        field: 'Information Systems',
      };

      const studentUserId = 'student-usr-9999';
      await service.searchOpportunities(explicitVoiceQuery, studentUserId);

      // Student profile shouldn't even be called since both academicYear and field were specified
      expect(mockPrisma.studentProfile.findUnique).not.toHaveBeenCalled();

      expect(mockPrisma.opportunity.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eligibleFields: {
              hasSome: expect.arrayContaining(['Information Systems']),
            },
            AND: expect.arrayContaining([
              {
                OR: [
                  { minimumAcademicYear: null },
                  { minimumAcademicYear: { lte: 4 } },
                ],
              },
              {
                OR: [
                  { maximumAcademicYear: null },
                  { maximumAcademicYear: { gte: 4 } },
                ],
              },
            ]),
          }),
        }),
      );
    });
  });
});
