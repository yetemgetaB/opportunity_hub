import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  OpportunityStatus,
  OpportunityType,
  OrgVerificationStatus,
  SkillRequirementLevel,
} from '@prisma/client';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesRepository } from './opportunities.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { NotificationsService } from '@/notifications/notifications.service';
import { CvStorageService } from '@/student-profile/cv-storage.service';

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;
  let repository: OpportunitiesRepository;
  let prisma: PrismaService;

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndOrganizationId: jest.fn(),
    findApplicationsByOpportunityId: jest.fn(),
    findByOrganizationId: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    addSkill: jest.fn(),
    removeSkill: jest.fn(),
    replaceSkills: jest.fn(),
    findSkillsByOpportunityId: jest.fn(),
  };

  const mockPrisma = {
    organizationMember: {
      findFirst: jest.fn(),
    },
  };

  const userId = '11111111-1111-1111-1111-111111111111';
  const orgId = '22222222-2222-2222-2222-222222222222';
  const oppId = '33333333-3333-3333-3333-333333333333';

  const mockMembership = {
    userId,
    organizationId: orgId,
    organization: {
      id: orgId,
      name: 'Acme Corp',
      verificationStatus: OrgVerificationStatus.APPROVED,
      deletedAt: null,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        {
          provide: OpportunitiesRepository,
          useValue: mockRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
            sendNotification: jest.fn(),
          },
        },
        {
          provide: CvStorageService,
          useValue: {
            createSignedDownloadUrl: jest.fn().mockResolvedValue('https://signed.url/cv.pdf'),
          },
        },
      ],
    }).compile();

    service = module.get<OpportunitiesService>(OpportunitiesService);
    repository = module.get<OpportunitiesRepository>(OpportunitiesRepository);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('createOpportunity', () => {
    it('should create an opportunity successfully for an organization member', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(mockMembership);
      const dto: CreateOpportunityDto = {
        title: 'Software Engineer Intern',
        description: 'Internship role for engineers',
        opportunityType: OpportunityType.INTERNSHIP,
        skills: [
          {
            skillId: '44444444-4444-4444-4444-444444444444',
            requirementLevel: SkillRequirementLevel.REQUIRED,
          },
        ],
      };
      const expectedResult = { id: oppId, ...dto, organizationId: orgId };
      mockRepository.create.mockResolvedValue(expectedResult);

      const result = await service.createOpportunity(userId, dto);

      expect(prisma.organizationMember.findFirst).toHaveBeenCalledWith({
        where: { userId },
        include: { organization: true },
      });
      expect(repository.create).toHaveBeenCalledWith({
        organizationId: orgId,
        title: dto.title,
        description: dto.description,
        opportunityType: dto.opportunityType,
        status: undefined,
        location: undefined,
        isRemote: undefined,
        applicationDeadline: undefined,
        minimumAcademicYear: undefined,
        maximumAcademicYear: undefined,
        minimumGpa: undefined,
        eligibleFields: undefined,
        compensation: undefined,
        applicationUrl: undefined,
        skills: [
          {
            skillId: '44444444-4444-4444-4444-444444444444',
            requirementLevel: SkillRequirementLevel.REQUIRED,
          },
        ],
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if user is not part of an organization', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(null);
      const dto: CreateOpportunityDto = {
        title: 'Title',
        description: 'Description',
        opportunityType: OpportunityType.INTERNSHIP,
      };

      await expect(service.createOpportunity(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if minimumAcademicYear > maximumAcademicYear', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(mockMembership);
      const dto: CreateOpportunityDto = {
        title: 'Title',
        description: 'Description',
        opportunityType: OpportunityType.INTERNSHIP,
        minimumAcademicYear: 4,
        maximumAcademicYear: 2,
      };

      await expect(service.createOpportunity(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if unapproved organization tries to create PUBLISHED opportunity', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue({
        ...mockMembership,
        organization: {
          ...mockMembership.organization,
          verificationStatus: OrgVerificationStatus.PENDING,
        },
      });
      const dto: CreateOpportunityDto = {
        title: 'Title',
        description: 'Description',
        opportunityType: OpportunityType.INTERNSHIP,
        status: OpportunityStatus.PUBLISHED,
      };

      await expect(service.createOpportunity(userId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getMyOpportunities', () => {
    it('should return all opportunities for the authenticated organization', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(mockMembership);
      const expected = [{ id: oppId, organizationId: orgId }];
      mockRepository.findByOrganizationId.mockResolvedValue(expected);

      const result = await service.getMyOpportunities(userId);
      expect(repository.findByOrganizationId).toHaveBeenCalledWith(orgId);
      expect(result).toEqual(expected);
    });
  });

  describe('getMyOpportunity', () => {
    it('should return specific opportunity belonging to organization', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(mockMembership);
      const expected = { id: oppId, organizationId: orgId };
      mockRepository.findByIdAndOrganizationId.mockResolvedValue(expected);

      const result = await service.getMyOpportunity(userId, oppId);
      expect(repository.findByIdAndOrganizationId).toHaveBeenCalledWith(oppId, orgId);
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if opportunity is not found or belongs to another organization', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(mockMembership);
      mockRepository.findByIdAndOrganizationId.mockResolvedValue(null);

      await expect(service.getMyOpportunity(userId, oppId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOpportunityApplicants', () => {
  it('returns applicants when the organization owns the opportunity', async () => {
    const applicants = [
  {
    id: 'application-1',
    status: 'PENDING',
    appliedAt: new Date(),
    updatedAt: new Date(),

    studentProfile: {
      academicYear: 3,
      university: 'Unity University',
      fieldOfStudy: 'Computer Science',
      location: 'Addis Ababa',
      careerGoals: 'Become a software engineer',
      careerGoalTags: ['backend', 'software engineering'],
      interests: ['AI', 'Web Development'],

      user: {
        id: userId,
        firstName: 'John',
        middleName: 'Doe',
        lastName: 'Smith',
        avatarUrl: null,
      },

      skills: [
        {
          proficiency: 4,
          yearsOfExperience: 2,
          skill: {
            id: 'skill-1',
            name: 'NestJS',
            category: 'Backend',
            description: 'Node.js framework',
          },
        },
      ],

      experiences: [
        {
          id: 'experience-1',
          title: 'Backend Intern',
          organizationName: 'Tech Corp',
          experienceType: 'INTERNSHIP',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-09-01'),
          location: 'Addis Ababa',
          description: 'Worked on backend APIs',
        },
      ],

      cvs: [
        {
          id: 'cv-1',
          fileName: 'resume.pdf',
          fileType: 'application/pdf',
          fileSize: 102400,
          isDefault: true,
          uploadedAt: new Date(),
        },
      ],
    },
  },
];

    mockPrisma.organizationMember.findFirst.mockResolvedValue(
      mockMembership,
    );

    mockRepository.findByIdAndOrganizationId.mockResolvedValue({
      id: oppId,
      organizationId: orgId,
    });

    mockRepository.findApplicationsByOpportunityId.mockResolvedValue(
      applicants,
    );

    const result = await service.getOpportunityApplicants(userId, oppId);

    expect(
      prisma.organizationMember.findFirst,
    ).toHaveBeenCalledWith({
      where: { userId },
      include: { organization: true },
    });

    expect(
      repository.findByIdAndOrganizationId,
    ).toHaveBeenCalledWith(oppId, orgId);

    expect(
      repository.findApplicationsByOpportunityId,
    ).toHaveBeenCalledWith(oppId);

    expect(result).toEqual([
  {
    application: {
      id: 'application-1',
      status: 'PENDING',
      appliedAt: applicants[0].appliedAt,
      updatedAt: applicants[0].updatedAt,
    },
    student: {
      id: userId,
      firstName: 'John',
      middleName: 'Doe',
      lastName: 'Smith',
      avatarUrl: null,

      profile: {
        academicYear: 3,
        university: 'Unity University',
        fieldOfStudy: 'Computer Science',
        location: 'Addis Ababa',
        careerGoals: 'Become a software engineer',
        careerGoalTags: ['backend', 'software engineering'],
        interests: ['AI', 'Web Development'],
      },

      skills: [
        {
          skillId: 'skill-1',
          name: 'NestJS',
          category: 'Backend',
          description: 'Node.js framework',
          proficiency: 4,
          yearsOfExperience: 2,
        },
      ],

      experiences: [
        {
          id: 'experience-1',
          title: 'Backend Intern',
          organizationName: 'Tech Corp',
          experienceType: 'INTERNSHIP',
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-09-01'),
          location: 'Addis Ababa',
          description: 'Worked on backend APIs',
        },
      ],

      cvs: [
        {
          id: 'cv-1',
          fileName: 'resume.pdf',
          fileType: 'application/pdf',
          fileSize: 102400,
          isDefault: true,
          uploadedAt: expect.any(Date),
        },
      ],
    },
  },
]);
  });

  it('throws NotFoundException when the opportunity does not belong to the organization', async () => {
    mockPrisma.organizationMember.findFirst.mockResolvedValue(
      mockMembership,
    );

    mockRepository.findByIdAndOrganizationId.mockResolvedValue(null);

    await expect(
      service.getOpportunityApplicants(userId, oppId),
    ).rejects.toThrow(NotFoundException);

    expect(
      repository.findApplicationsByOpportunityId,
    ).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the user is not an organization member', async () => {
    mockPrisma.organizationMember.findFirst.mockResolvedValue(null);

    await expect(
      service.getOpportunityApplicants(userId, oppId),
    ).rejects.toThrow(NotFoundException);

    expect(
      repository.findByIdAndOrganizationId,
    ).not.toHaveBeenCalled();

    expect(
      repository.findApplicationsByOpportunityId,
    ).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the organization is deleted', async () => {
    mockPrisma.organizationMember.findFirst.mockResolvedValue({
      ...mockMembership,
      organization: {
        ...mockMembership.organization,
        deletedAt: new Date(),
      },
    });

    await expect(
      service.getOpportunityApplicants(userId, oppId),
    ).rejects.toThrow(NotFoundException);

    expect(
      repository.findByIdAndOrganizationId,
    ).not.toHaveBeenCalled();

    expect(
      repository.findApplicationsByOpportunityId,
    ).not.toHaveBeenCalled();
  });
});

  describe('updateOpportunity', () => {
    it('should update opportunity and replace skills when skills are provided', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(mockMembership);
      const existingOpp = {
        id: oppId,
        organizationId: orgId,
        status: OpportunityStatus.DRAFT,
        minimumAcademicYear: 2,
        maximumAcademicYear: 4,
      };
      mockRepository.findByIdAndOrganizationId.mockResolvedValue(existingOpp);
      mockRepository.replaceSkills.mockResolvedValue([]);
      mockRepository.update.mockResolvedValue(existingOpp);

      const updateDto: UpdateOpportunityDto = {
        title: 'Updated Title',
        skills: [
          {
            skillId: '44444444-4444-4444-4444-444444444444',
            requirementLevel: SkillRequirementLevel.PREFERRED,
          },
        ],
      };

      const result = await service.updateOpportunity(userId, oppId, updateDto);

      expect(repository.replaceSkills).toHaveBeenCalledWith(oppId, [
        {
          skillId: '44444444-4444-4444-4444-444444444444',
          requirementLevel: SkillRequirementLevel.PREFERRED,
        },
      ]);
      expect(repository.update).toHaveBeenCalled();
      expect(result).toEqual(existingOpp);
    });

    it('should throw BadRequestException if update violates academic year range', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(mockMembership);
      const existingOpp = {
        id: oppId,
        organizationId: orgId,
        minimumAcademicYear: 2,
        maximumAcademicYear: 4,
      };
      mockRepository.findByIdAndOrganizationId.mockResolvedValue(existingOpp);

      await expect(
        service.updateOpportunity(userId, oppId, { minimumAcademicYear: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if unapproved organization tries to update status to PUBLISHED', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue({
        ...mockMembership,
        organization: {
          ...mockMembership.organization,
          verificationStatus: OrgVerificationStatus.REJECTED,
        },
      });
      const existingOpp = {
        id: oppId,
        organizationId: orgId,
        status: OpportunityStatus.DRAFT,
      };
      mockRepository.findByIdAndOrganizationId.mockResolvedValue(existingOpp);

      await expect(
        service.updateOpportunity(userId, oppId, {
          status: OpportunityStatus.PUBLISHED,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteOpportunity', () => {
    it('should soft delete opportunity scoped to organization', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(mockMembership);
      mockRepository.softDelete.mockResolvedValue({ id: oppId, deletedAt: new Date() });

      const result = await service.deleteOpportunity(userId, oppId);

      expect(repository.softDelete).toHaveBeenCalledWith(oppId, orgId);
      expect(result).toEqual({ message: 'Opportunity deleted successfully.' });
    });
  });

  describe('publishOpportunity', () => {
    it('should publish opportunity for APPROVED organization', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue(mockMembership);
      const existingOpp = {
        id: oppId,
        organizationId: orgId,
        status: OpportunityStatus.DRAFT,
      };
      const publishedOpp = {
        ...existingOpp,
        status: OpportunityStatus.PUBLISHED,
      };
      mockRepository.findByIdAndOrganizationId
        .mockResolvedValueOnce(existingOpp)
        .mockResolvedValueOnce(publishedOpp);
      mockRepository.update.mockResolvedValue(publishedOpp);

      const result = await service.publishOpportunity(userId, oppId);

      expect(repository.update).toHaveBeenCalledWith(
        oppId,
        { status: OpportunityStatus.PUBLISHED },
        orgId,
      );
      expect(result).toEqual(publishedOpp);
    });

    it('should reject publication for SUSPENDED organization', async () => {
      mockPrisma.organizationMember.findFirst.mockResolvedValue({
        ...mockMembership,
        organization: {
          ...mockMembership.organization,
          verificationStatus: OrgVerificationStatus.SUSPENDED,
        },
      });

      await expect(service.publishOpportunity(userId, oppId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('search and public details', () => {
    it('searchOpportunities searches published opportunities with keyword and filters', async () => {
      const opp = {
        id: oppId,
        title: 'Frontend Engineer',
        skills: [{ skill: { name: 'React' }, requirementLevel: SkillRequirementLevel.REQUIRED }],
        eligibleFields: ['Computer Science'],
        location: 'Remote',
        opportunityType: OpportunityType.JOB,
        isRemote: true,
      };
      mockRepository.findMany.mockResolvedValue([opp]);

      const result = await service.searchOpportunities({
        keyword: 'Engineer',
        type: OpportunityType.JOB,
      });
      expect(repository.findMany).toHaveBeenCalledWith({
        keyword: 'Engineer',
        status: OpportunityStatus.PUBLISHED,
        opportunityType: OpportunityType.JOB,
        location: undefined,
        skillIds: undefined,
        eligibleFields: undefined,
        hasActiveDeadline: true,
      });
      expect(result).toEqual([
        {
          id: oppId,
          title: 'Frontend Engineer',
          skills: ['React'],
          eligibleFields: ['Computer Science'],
          location: 'Remote',
          opportunityType: OpportunityType.JOB,
          isRemote: true,
        },
      ]);
    });

    it('getPublishedOpportunity returns mapped details', async () => {
      const opp = {
        id: oppId,
        title: 'Frontend Engineer',
        description: 'Great role',
        status: OpportunityStatus.PUBLISHED,
        deletedAt: null,
        skills: [{ skillId: 's-1', skill: { name: 'React' }, requirementLevel: SkillRequirementLevel.REQUIRED }],
        eligibleFields: ['CS'],
        location: 'Addis Ababa',
        isRemote: false,
        opportunityType: OpportunityType.JOB,
        applicationDeadline: null,
        minimumAcademicYear: null,
        maximumAcademicYear: null,
        minimumGpa: null,
        compensation: null,
        applicationUrl: null,
        organization: {
          id: orgId,
          name: 'Tech Inc',
          description: 'Top tech company',
          websiteUrl: 'https://tech.example.com',
        },
      };
      mockRepository.findById.mockResolvedValue(opp);

      const result = await service.getPublishedOpportunity(oppId);
      expect(result.id).toEqual(oppId);
      expect(result.organization?.name).toEqual('Tech Inc');
    });

    it('getPublishedOpportunity throws NotFoundException for unpublished or soft-deleted opportunity', async () => {
      mockRepository.findById.mockResolvedValue({
        id: oppId,
        status: OpportunityStatus.DRAFT,
        deletedAt: null,
      });

      await expect(service.getPublishedOpportunity(oppId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
