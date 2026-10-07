import { Test, TestingModule } from '@nestjs/testing';
import {
  AssessmentQuestionType,
  AssessmentStatus,
} from '@prisma/client';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';
import { OrganizationProfileRepository } from '@/organization-profile/organization-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';
import { AIQuestionService } from './ai-question.service';
import { AIApplicantAnalysisService } from './ai-applicant-analysis.service';

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  const assessmentsRepository = {
    create: jest.fn(),
    getAssessment: jest.fn(),
    getAssessmentQuestions: jest.fn(),
    update: jest.fn(),
  };

  const organizationProfileRepository = {
    findByUserId: jest.fn(),
  };

  const opportunitiesRepository = {
    findById: jest.fn(),
    findByIdAndOrganizationId: jest.fn(),
  };

  const aiQuestionService = {
    generateQuestions: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AssessmentsService,
          {
            provide: AssessmentsRepository,
            useValue: assessmentsRepository,
          },
          {
            provide: OrganizationProfileRepository,
            useValue: organizationProfileRepository,
          },
          {
            provide: OpportunitiesRepository,
            useValue: opportunitiesRepository,
          },
          {
            provide: AIQuestionService,
            useValue: aiQuestionService,
          },
          {
            provide: AIApplicantAnalysisService,
            useValue: {},
          },
        ],
      }).compile();

    service = module.get<AssessmentsService>(
      AssessmentsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when organization membership is not found', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue(null);

    await expect(
      service.createAssessment('user-123', 'opp-123'),
    ).rejects.toThrow(
      'Organization membership not found.',
    );

    expect(
      opportunitiesRepository.findById,
    ).not.toHaveBeenCalled();

    expect(
      aiQuestionService.generateQuestions,
    ).not.toHaveBeenCalled();

    expect(
      assessmentsRepository.create,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when opportunity is not found', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue({
      organizationId: 'org-123',
      organization: {
        deletedAt: null,
      },
    });

    opportunitiesRepository.findById.mockResolvedValue(
      null,
    );

    await expect(
      service.createAssessment('user-123', 'opp-123'),
    ).rejects.toThrow('Opportunity not found.');

    expect(
      opportunitiesRepository.findById,
    ).toHaveBeenCalledWith('opp-123');

    expect(
      aiQuestionService.generateQuestions,
    ).not.toHaveBeenCalled();

    expect(
      assessmentsRepository.create,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when organization does not own the opportunity', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue({
      organizationId: 'org-123',
      organization: {
        deletedAt: null,
      },
    });

    opportunitiesRepository.findById.mockResolvedValue({
      id: 'opp-123',
      title: 'Software Engineering Internship',
      organizationId: 'org-456',
    });

    await expect(
      service.createAssessment('user-123', 'opp-123'),
    ).rejects.toThrow(
      'You are not authorized to create an assessment for this opportunity.',
    );

    expect(
      opportunitiesRepository.findById,
    ).toHaveBeenCalledWith('opp-123');

    expect(
      aiQuestionService.generateQuestions,
    ).not.toHaveBeenCalled();

    expect(
      assessmentsRepository.create,
    ).not.toHaveBeenCalled();
  });

  it('should generate AI questions and create an assessment for an organization opportunity', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue({
      organizationId: 'org-123',
      organization: {
        deletedAt: null,
      },
    });

    opportunitiesRepository.findById.mockResolvedValue({
      id: 'opp-123',
      title: 'Software Engineering Internship',
      description:
        'Build backend APIs and work with the engineering team.',
      organizationId: 'org-123',
      location: 'Addis Ababa',
      eligibleFields: ['Computer Science'],
      minimumAcademicYear: 3,
      maximumAcademicYear: 5,
      minimumGpa: 2.5,
      opportunityType: 'INTERNSHIP',
      skills: [
        {
          requirementLevel: 'REQUIRED',
          skill: {
            name: 'TypeScript',
          },
        },
        {
          requirementLevel: 'REQUIRED',
          skill: {
            name: 'NestJS',
          },
        },
        {
          requirementLevel: 'PREFERRED',
          skill: {
            name: 'PostgreSQL',
          },
        },
      ],
    });

    aiQuestionService.generateQuestions.mockResolvedValue({
      questions: [
        {
          question:
            'What is dependency injection in NestJS?',
          type: 'technical',
        },
        {
          question:
            'How would you design a REST API using NestJS?',
          type: 'technical',
        },
        {
          question:
            'Describe a backend project you have worked on.',
          type: 'experience',
        },
        {
          question:
            'How do you collaborate with other developers on a software project?',
          type: 'behavioral',
        },
        {
          question:
            'How would you approach debugging a failing backend API?',
          type: 'general',
        },
      ],
    });

    assessmentsRepository.create.mockResolvedValue({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      title:
        'Software Engineering Internship Assessment',
      questions: [
        {
          questionText:
            'What is dependency injection in NestJS?',
          questionOrder: 1,
        },
        {
          questionText:
            'How would you design a REST API using NestJS?',
          questionOrder: 2,
        },
        {
          questionText:
            'Describe a backend project you have worked on.',
          questionOrder: 3,
        },
        {
          questionText:
            'How do you collaborate with other developers on a software project?',
          questionOrder: 4,
        },
        {
          questionText:
            'How would you approach debugging a failing backend API?',
          questionOrder: 5,
        },
      ],
    });

    const result = await service.createAssessment(
      'user-123',
      'opp-123',
    );

    expect(
      organizationProfileRepository.findByUserId,
    ).toHaveBeenCalledWith('user-123');

    expect(
      opportunitiesRepository.findById,
    ).toHaveBeenCalledWith('opp-123');

    expect(
      aiQuestionService.generateQuestions,
    ).toHaveBeenCalledWith({
      title: 'Software Engineering Internship',
      description:
        'Build backend APIs and work with the engineering team.',
      requiredSkills: ['TypeScript', 'NestJS'],
      location: 'Addis Ababa',
      eligibleFields: ['Computer Science'],
      minimumAcademicYear: 3,
      maximumAcademicYear: 5,
      minimumGpa: 2.5,
      opportunityType: 'INTERNSHIP',
    });

    expect(
      assessmentsRepository.create,
    ).toHaveBeenCalledWith({
      opportunityId: 'opp-123',
      title:
        'Software Engineering Internship Assessment',
      questions: [
        {
          questionText:
            'What is dependency injection in NestJS?',
          questionType: AssessmentQuestionType.TEXT,
          questionOrder: 1,
          isAiGenerated: true,
        },
        {
          questionText:
            'How would you design a REST API using NestJS?',
          questionType: AssessmentQuestionType.TEXT,
          questionOrder: 2,
          isAiGenerated: true,
        },
        {
          questionText:
            'Describe a backend project you have worked on.',
          questionType: AssessmentQuestionType.TEXT,
          questionOrder: 3,
          isAiGenerated: true,
        },
        {
          questionText:
            'How do you collaborate with other developers on a software project?',
          questionType: AssessmentQuestionType.TEXT,
          questionOrder: 4,
          isAiGenerated: true,
        },
        {
          questionText:
            'How would you approach debugging a failing backend API?',
          questionType: AssessmentQuestionType.TEXT,
          questionOrder: 5,
          isAiGenerated: true,
        },
      ],
    });

    expect(result).toEqual({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      title:
        'Software Engineering Internship Assessment',
      questions: [
        {
          questionText:
            'What is dependency injection in NestJS?',
          questionOrder: 1,
        },
        {
          questionText:
            'How would you design a REST API using NestJS?',
          questionOrder: 2,
        },
        {
          questionText:
            'Describe a backend project you have worked on.',
          questionOrder: 3,
        },
        {
          questionText:
            'How do you collaborate with other developers on a software project?',
          questionOrder: 4,
        },
        {
          questionText:
            'How would you approach debugging a failing backend API?',
          questionOrder: 5,
        },
      ],
    });
  });

  it('should get an assessment', async () => {
    assessmentsRepository.getAssessment.mockResolvedValue({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      title:
        'Software Engineering Internship Assessment',
    });

    const result = await service.getAssessment(
      'assessment-123',
    );

    expect(
      assessmentsRepository.getAssessment,
    ).toHaveBeenCalledWith('assessment-123');

    expect(result).toEqual({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      title:
        'Software Engineering Internship Assessment',
    });
  });

  it('should get assessment questions', async () => {
    assessmentsRepository.getAssessmentQuestions.mockResolvedValue([
      {
        id: 'question-1',
        assessmentId: 'assessment-123',
        questionText: 'What is polymorphism?',
        questionOrder: 1,
      },
    ]);

    const result =
      await service.getAssessmentQuestions(
        'assessment-123',
      );

    expect(
      assessmentsRepository.getAssessmentQuestions,
    ).toHaveBeenCalledWith('assessment-123');

    expect(result).toEqual([
      {
        id: 'question-1',
        assessmentId: 'assessment-123',
        questionText: 'What is polymorphism?',
        questionOrder: 1,
      },
    ]);
  });

    it('should prevent starting an assessment before the application deadline', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue({
      organizationId: 'org-123',
      organization: {
        deletedAt: null,
      },
    });

    const futureDeadline = new Date(
      Date.now() + 60 * 60 * 1000,
    );

    opportunitiesRepository.findById.mockResolvedValue({
      id: 'opp-123',
      organizationId: 'org-123',
      applicationDeadline: futureDeadline,
    });

    await expect(
      service.startAssessment('user-123', 'opp-123'),
    ).rejects.toThrow(
      'The application deadline has not passed yet.',
    );

    expect(
      assessmentsRepository.getAssessment,
    ).not.toHaveBeenCalled();

    expect(
      assessmentsRepository.update,
    ).not.toHaveBeenCalled();
  });

  it('should start a draft assessment after the application deadline', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue({
      organizationId: 'org-123',
      organization: {
        deletedAt: null,
      },
    });

    const pastDeadline = new Date(
      Date.now() - 60 * 60 * 1000,
    );

    opportunitiesRepository.findById.mockResolvedValue({
      id: 'opp-123',
      organizationId: 'org-123',
      applicationDeadline: pastDeadline,
    });

    assessmentsRepository.getAssessment.mockResolvedValue({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      status: AssessmentStatus.DRAFT,
    });

    assessmentsRepository.update.mockResolvedValue({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      status: AssessmentStatus.ACTIVE,
    });

    const result = await service.startAssessment(
      'user-123',
      'opp-123',
    );

    expect(
      assessmentsRepository.getAssessment,
    ).toHaveBeenCalledWith('opp-123');

    expect(
      assessmentsRepository.update,
    ).toHaveBeenCalledWith(
      'assessment-123',
      {
        status: AssessmentStatus.ACTIVE,
      },
    );

    expect(result).toEqual({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      status: AssessmentStatus.ACTIVE,
    });
  });
});
