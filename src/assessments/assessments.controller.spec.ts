import { Test, TestingModule } from '@nestjs/testing';

import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { SupabaseAuthGuard } from '@/auth/guards/supabase-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

describe('AssessmentsController', () => {
  let controller: AssessmentsController;

  let service: {
    createAssessment: jest.Mock;
    prepareApplicantAnalysis: jest.Mock;
    getAssessmentResultsByOpportunity: jest.Mock;
    getAssessment: jest.Mock;
    getAssessmentQuestions: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentsController],
      providers: [
        {
          provide: AssessmentsService,
          useValue: {
            createAssessment: jest.fn(),
            prepareApplicantAnalysis: jest.fn(),
            getAssessmentResultsByOpportunity: jest.fn(),
            getAssessment: jest.fn(),
            getAssessmentQuestions: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<AssessmentsController>(
      AssessmentsController,
    );

    service = module.get(AssessmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an assessment', async () => {
    service.createAssessment.mockResolvedValue({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      title: 'Software Engineering Internship Assessment',
    });

    const result = await controller.createAssessment(
      'user-123',
      'opp-123',
    );

    expect(service.createAssessment).toHaveBeenCalledWith(
      'user-123',
      'opp-123',
    );

    expect(result).toEqual({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      title: 'Software Engineering Internship Assessment',
    });
  });

  it('should trigger applicant analysis', async () => {
    service.prepareApplicantAnalysis.mockResolvedValue({
      opportunityId: 'opp-123',
      eligibleApplicants: [],
      totalEligibleApplicants: 0,
    });

    const result = await controller.analyzeApplicants(
      'user-123',
      'opp-123',
    );

    expect(service.prepareApplicantAnalysis).toHaveBeenCalledWith(
      'user-123',
      'opp-123',
    );

    expect(result).toEqual({
      opportunityId: 'opp-123',
      eligibleApplicants: [],
      totalEligibleApplicants: 0,
    });
  });

  it('should get candidate assessment results', async () => {
    const filters = {
      minScore: 70,
      isFinalApproved: true,
      orderBy: 'finalScore_desc',
      skip: 0,
      take: 20,
    };

    service.getAssessmentResultsByOpportunity.mockResolvedValue({
      opportunityId: 'opp-123',
      candidates: [],
    });

    const result = await controller.getCandidateResults(
      'user-123',
      'opp-123',
      filters,
    );

    expect(
      service.getAssessmentResultsByOpportunity,
    ).toHaveBeenCalledWith(
      'user-123',
      'opp-123',
      filters,
    );

    expect(result).toEqual({
      opportunityId: 'opp-123',
      candidates: [],
    });
  });

  it('should get an assessment', async () => {
    service.getAssessment.mockResolvedValue({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      title: 'Software Engineering Internship Assessment',
    });

    const result = await controller.getAssessment(
      'assessment-123',
    );

    expect(service.getAssessment).toHaveBeenCalledWith(
      'assessment-123',
    );

    expect(result).toEqual({
      id: 'assessment-123',
      opportunityId: 'opp-123',
      title: 'Software Engineering Internship Assessment',
    });
  });

  it('should get assessment questions', async () => {
    service.getAssessmentQuestions.mockResolvedValue([
      {
        id: 'question-1',
        assessmentId: 'assessment-123',
        questionText: 'What is polymorphism?',
        questionOrder: 1,
      },
    ]);

    const result = await controller.getAssessmentQuestions(
      'assessment-123',
    );

    expect(service.getAssessmentQuestions).toHaveBeenCalledWith(
      'assessment-123',
    );

    expect(result).toEqual([
      {
        id: 'question-1',
        assessmentId: 'assessment-123',
        questionText: 'What is polymorphism?',
        questionOrder: 1,
      },
    ]);
  });
});