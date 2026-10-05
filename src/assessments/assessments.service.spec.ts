import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsService } from './assessments.service';

import { AssessmentsRepository } from './assessments.repository';
import { OrganizationProfileRepository } from '@/organization-profile/organization-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  const assessmentsRepository = {
    createAssessment: jest.fn(),
    getAssessment: jest.fn(),
    getAssessmentQuestions: jest.fn(),
  };

  const organizationProfileRepository = {
    findByUserId: jest.fn(),
  };

  const opportunitiesRepository = {
    findById: jest.fn(),
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
        ],
      }).compile();

    service =
      module.get<AssessmentsService>(
        AssessmentsService,
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when organization membership is not found', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue(
      null,
    );

    await expect(
      service.createAssessment(
        'user-123',
        'opp-123',
      ),
    ).rejects.toThrow(
      'Organization membership not found.',
    );

    expect(
      opportunitiesRepository.findById,
    ).not.toHaveBeenCalled();

    expect(
      assessmentsRepository.createAssessment,
    ).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when opportunity is not found', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue(
      {
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      },
    );

    opportunitiesRepository.findById.mockResolvedValue(
      null,
    );

    await expect(
      service.createAssessment(
        'user-123',
        'opp-123',
      ),
    ).rejects.toThrow(
      'Opportunity not found.',
    );

    expect(
      opportunitiesRepository.findById,
    ).toHaveBeenCalledWith('opp-123');

    expect(
      assessmentsRepository.createAssessment,
    ).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when organization does not own the opportunity', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue(
      {
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      },
    );

    opportunitiesRepository.findById.mockResolvedValue(
      {
        id: 'opp-123',
        title: 'Software Engineering Internship',
        organizationId: 'org-456',
      },
    );

    await expect(
      service.createAssessment(
        'user-123',
        'opp-123',
      ),
    ).rejects.toThrow(
      'You are not authorized to create an assessment for this opportunity.',
    );

    expect(
      opportunitiesRepository.findById,
    ).toHaveBeenCalledWith('opp-123');

    expect(
      assessmentsRepository.createAssessment,
    ).not.toHaveBeenCalled();
  });

  it('should create an assessment for an organization opportunity', async () => {
    organizationProfileRepository.findByUserId.mockResolvedValue(
      {
        organizationId: 'org-123',
        organization: {
          deletedAt: null,
        },
      },
    );

    opportunitiesRepository.findById.mockResolvedValue(
      {
        id: 'opp-123',
        title: 'Software Engineering Internship',
        organizationId: 'org-123',
      },
    );

    assessmentsRepository.createAssessment.mockResolvedValue(
      {
        id: 'assessment-123',
        opportunityId: 'opp-123',
        title:
          'Software Engineering Internship Assessment',
      },
    );

    const result =
      await service.createAssessment(
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
      assessmentsRepository.createAssessment,
    ).toHaveBeenCalledWith(
      'opp-123',
      'Software Engineering Internship Assessment',
    );

    expect(result).toEqual({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      title:
        'Software Engineering Internship Assessment',
    });
  });

  it('should get an assessment', async () => {
    assessmentsRepository.getAssessment.mockResolvedValue(
      {
        id: 'assessment-123',
        opportunityId: 'opp-123',
        title:
          'Software Engineering Internship Assessment',
      },
    );

    const result =
      await service.getAssessment(
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
    assessmentsRepository.getAssessmentQuestions.mockResolvedValue(
      [
        {
          id: 'question-1',
          assessmentId: 'assessment-123',
          questionText:
            'What is polymorphism?',
          questionOrder: 1,
        },
      ],
    );

    const result =
      await service.getAssessmentQuestions(
        'assessment-123',
      );

    expect(
      assessmentsRepository.getAssessmentQuestions,
    ).toHaveBeenCalledWith(
      'assessment-123',
    );

    expect(result).toEqual([
      {
        id: 'question-1',
        assessmentId: 'assessment-123',
        questionText:
          'What is polymorphism?',
        questionOrder: 1,
      },
    ]);
  });
});

