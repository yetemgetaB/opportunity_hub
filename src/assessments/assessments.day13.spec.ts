import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  AssessmentAttemptStatus,
  AssessmentQuestionType,
  AssessmentStatus,
  Prisma,
  SkillRequirementLevel,
} from '@prisma/client';
import { AssessmentsRepository } from './assessments.repository';
import { AssessmentsService } from './assessments.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationProfileRepository } from '@/organization-profile/organization-profile.repository';
import { OpportunitiesRepository } from '@/opportunities/opportunities.repository';

describe('Day 13 Backend 2: Assessments Data Foundation', () => {
  let repository: AssessmentsRepository;
  let service: AssessmentsService;
  let mockPrisma: any;
  let mockOrgProfileRepo: any;
  let mockOppsRepo: any;

  const mockDate = new Date('2026-10-04T10:00:00Z');
  const opportunityId = 'opp-1111-1111-1111-111111111111';
  const otherOpportunityId = 'opp-9999-9999-9999-999999999999';
  const assessmentId = 'asmt-2222-2222-2222-222222222222';
  const otherAssessmentId = 'asmt-8888-8888-8888-888888888888';
  const applicationId = 'app-3333-3333-3333-333333333333';
  const attemptId = 'att-4444-4444-4444-444444444444';
  const questionId = 'qst-5555-5555-5555-555555555555';
  const answerId = 'ans-6666-6666-6666-666666666666';
  const resultId = 'res-7777-7777-7777-777777777777';
  const studentProfileId = 'usr-student-1111-111111111111';

  const mockApplication = {
    id: applicationId,
    studentProfileId,
    opportunityId,
    status: 'SUBMITTED',
    appliedAt: mockDate,
    updatedAt: mockDate,
    opportunity: {
      id: opportunityId,
      title: 'Backend Software Engineer',
      organizationId: 'org-1111-1111-1111-111111111111',
    },
  };

  const mockAssessment = {
    id: assessmentId,
    opportunityId,
    title: 'Backend Engineering Assessment',
    instructions: 'Answer all technical questions.',
    timeLimitMinutes: 60,
    status: AssessmentStatus.ACTIVE,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockQuestion = {
    id: questionId,
    assessmentId,
    questionText: 'Explain PostgreSQL indexing strategies for GIN vs B-Tree.',
    questionType: AssessmentQuestionType.TEXT,
    questionOrder: 1,
    isAiGenerated: false,
    options: null,
    referenceAnswer: 'B-Tree is default for scalar lookups; GIN is for composite / array / jsonb queries.',
    evaluationGuidance: 'Check for clarity on B-tree ordering vs GIN inverted index.',
    requirementLevel: SkillRequirementLevel.REQUIRED,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockAttempt = {
    id: attemptId,
    applicationId,
    assessmentId,
    status: AssessmentAttemptStatus.IN_PROGRESS,
    startedAt: mockDate,
    submittedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockSubmittedAttempt = {
    ...mockAttempt,
    status: AssessmentAttemptStatus.SUBMITTED,
    submittedAt: new Date('2026-10-04T10:45:00Z'),
  };

  const mockAnswer = {
    id: answerId,
    assessmentAttemptId: attemptId,
    assessmentQuestionId: questionId,
    assessmentId,
    answerText: 'B-tree is suitable for comparison queries like equality and ranges...',
    answeredAt: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
    question: mockQuestion,
  };

  const mockAssessmentResult = {
    id: resultId,
    assessmentAttemptId: attemptId,
    aiScore: 88,
    aiRequirementMatch: 'HIGH',
    aiSkillAnalysis: {
      technicalKnowledge: 90,
      databaseDesign: 85,
    },
    aiStrengths: ['Strong database indexing knowledge', 'Clear technical writing'],
    aiGaps: ['Could mention partial indexes'],
    aiSummary: 'Candidate demonstrated deep understanding of relational indexing.',
    aiEvaluatedAt: mockDate,
    humanScore: null,
    humanFeedback: null,
    humanEvaluatorId: null,
    humanEvaluatedAt: null,
    finalScore: 88,
    finalSummary: 'Candidate demonstrated deep understanding of relational indexing.',
    finalStrengths: ['Strong database indexing knowledge', 'Clear technical writing'],
    finalGaps: ['Could mention partial indexes'],
    isFinalApproved: false,
    approvedAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(async () => {
    mockPrisma = {
      application: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      assessment: {
        findUnique: jest.fn(),
      },
      assessmentQuestion: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      assessmentAttempt: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      assessmentAnswer: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      assessmentResult: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };

    mockOrgProfileRepo = {
      findByUserId: jest.fn(),
    };

    mockOppsRepo = {
      findByIdAndOrganizationId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsRepository,
        AssessmentsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: OrganizationProfileRepository,
          useValue: mockOrgProfileRepo,
        },
        {
          provide: OpportunitiesRepository,
          useValue: mockOppsRepo,
        },
      ],
    }).compile();

    repository = module.get<AssessmentsRepository>(AssessmentsRepository);
    service = module.get<AssessmentsService>(AssessmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. ASSESSMENT ATTEMPT TESTS
  // ==========================================================================

  describe('Assessment Attempt Management', () => {
    describe('createAttempt', () => {
      it('should create an attempt with status IN_PROGRESS and startedAt timestamp', async () => {
        mockPrisma.application.findUnique.mockResolvedValue(mockApplication);
        mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(null);
        mockPrisma.assessmentAttempt.create.mockResolvedValue(mockAttempt);

        const result = await repository.createAttempt({
          applicationId,
          assessmentId,
        });

        expect(result).toEqual(mockAttempt);
        expect(mockPrisma.assessmentAttempt.create).toHaveBeenCalledWith({
          data: {
            application: { connect: { id: applicationId } },
            assessment: { connect: { id: assessmentId } },
            status: AssessmentAttemptStatus.IN_PROGRESS,
            startedAt: expect.any(Date),
          },
        });
      });

      it('should throw NotFoundException if application does not exist', async () => {
        mockPrisma.application.findUnique.mockResolvedValue(null);

        await expect(
          repository.createAttempt({
            applicationId: 'missing-app',
            assessmentId,
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException if assessment does not exist', async () => {
        mockPrisma.application.findUnique.mockResolvedValue(mockApplication);
        mockPrisma.assessment.findUnique.mockResolvedValue(null);

        await expect(
          repository.createAttempt({
            applicationId,
            assessmentId: 'missing-asmt',
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should enforce Diamond 1 integrity and reject when application and assessment belong to different opportunities', async () => {
        mockPrisma.application.findUnique.mockResolvedValue({
          ...mockApplication,
          opportunityId: otherOpportunityId,
        });
        mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment); // belongs to opportunityId

        await expect(
          repository.createAttempt({
            applicationId,
            assessmentId,
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should enforce 1:1 attempt constraint and throw ConflictException if attempt already exists for application', async () => {
        mockPrisma.application.findUnique.mockResolvedValue(mockApplication);
        mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);

        await expect(
          repository.createAttempt({
            applicationId,
            assessmentId,
          }),
        ).rejects.toThrow(ConflictException);
      });

      it('should handle Prisma P2002 duplicate unique constraint error gracefully', async () => {
        mockPrisma.application.findUnique.mockResolvedValue(mockApplication);
        mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(null);
        mockPrisma.assessmentAttempt.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Duplicate attempt', {
            code: 'P2002',
            clientVersion: '5.10.2',
          }),
        );

        await expect(
          repository.createAttempt({
            applicationId,
            assessmentId,
          }),
        ).rejects.toThrow(ConflictException);
      });
    });

    describe('findAttemptById & findAttemptByIdWithAnswers', () => {
      it('should retrieve attempt by ID', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);

        const result = await repository.findAttemptById(attemptId);
        expect(result).toEqual(mockAttempt);
      });

      it('should retrieve attempt by ID with nested answers and relations', async () => {
        const attemptWithAnswers = {
          ...mockAttempt,
          answers: [mockAnswer],
        };
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(attemptWithAnswers);

        const result = await repository.findAttemptByIdWithAnswers(attemptId);
        expect(result).toEqual(attemptWithAnswers);
        expect(mockPrisma.assessmentAttempt.findUnique).toHaveBeenCalledWith({
          where: { id: attemptId },
          include: expect.any(Object),
        });
      });

      it('should retrieve attempt by application ID', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);

        const result = await repository.findAttemptByApplicationId(applicationId);
        expect(result).toEqual(mockAttempt);
        expect(mockPrisma.assessmentAttempt.findUnique).toHaveBeenCalledWith({
          where: { applicationId },
          include: expect.any(Object),
        });
      });
    });

    describe('submitAttempt', () => {
      it('should submit an active in-progress attempt and set submittedAt', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);
        mockPrisma.assessmentAttempt.update.mockResolvedValue(mockSubmittedAttempt);

        const result = await repository.submitAttempt(attemptId);

        expect(result.status).toBe(AssessmentAttemptStatus.SUBMITTED);
        expect(mockPrisma.assessmentAttempt.update).toHaveBeenCalledWith({
          where: { id: attemptId },
          data: {
            status: AssessmentAttemptStatus.SUBMITTED,
            startedAt: mockAttempt.startedAt,
            submittedAt: expect.any(Date),
          },
        });
      });

      it('should reject submission if attempt is already SUBMITTED', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockSubmittedAttempt);

        await expect(repository.submitAttempt(attemptId)).rejects.toThrow(
          ConflictException,
        );
      });

      it('should throw NotFoundException if attempt to submit does not exist', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(null);

        await expect(repository.submitAttempt('missing-attempt')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('findSubmittedAttemptsByAssessmentId & findSubmittedAttemptsByOpportunityId', () => {
      it('should retrieve strictly submitted attempts for assessment', async () => {
        mockPrisma.assessmentAttempt.findMany.mockResolvedValue([mockSubmittedAttempt]);

        const result = await repository.findSubmittedAttemptsByAssessmentId(assessmentId);

        expect(result).toEqual([mockSubmittedAttempt]);
        expect(mockPrisma.assessmentAttempt.findMany).toHaveBeenCalledWith({
          where: {
            assessmentId,
            status: AssessmentAttemptStatus.SUBMITTED,
          },
          include: expect.any(Object),
          orderBy: { submittedAt: 'desc' },
        });
      });

      it('should retrieve strictly submitted attempts for opportunity', async () => {
        mockPrisma.assessmentAttempt.findMany.mockResolvedValue([mockSubmittedAttempt]);

        const result = await repository.findSubmittedAttemptsByOpportunityId(opportunityId);

        expect(result).toEqual([mockSubmittedAttempt]);
        expect(mockPrisma.assessmentAttempt.findMany).toHaveBeenCalledWith({
          where: {
            assessment: {
              opportunityId,
            },
            status: AssessmentAttemptStatus.SUBMITTED,
          },
          include: expect.any(Object),
          orderBy: { submittedAt: 'desc' },
        });
      });
    });
  });

  // ==========================================================================
  // 2. ASSESSMENT ANSWER PERSISTENCE & INTEGRITY TESTS
  // ==========================================================================

  describe('Assessment Answer Persistence', () => {
    describe('saveAnswer', () => {
      it('should save answer when attempt is IN_PROGRESS and question belongs to attempt assessment', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);
        mockPrisma.assessmentQuestion.findUnique.mockResolvedValue(mockQuestion);
        mockPrisma.assessmentAnswer.upsert.mockResolvedValue(mockAnswer);

        const result = await repository.saveAnswer({
          assessmentAttemptId: attemptId,
          assessmentQuestionId: questionId,
          answerText: 'B-tree is suitable for comparison queries...',
        });

        expect(result).toEqual(mockAnswer);
        expect(mockPrisma.assessmentAnswer.upsert).toHaveBeenCalledWith({
          where: {
            assessmentAttemptId_assessmentQuestionId: {
              assessmentAttemptId: attemptId,
              assessmentQuestionId: questionId,
            },
          },
          create: {
            assessmentAttemptId: attemptId,
            assessmentQuestionId: questionId,
            assessmentId: mockAttempt.assessmentId,
            answerText: 'B-tree is suitable for comparison queries...',
            answeredAt: expect.any(Date),
          },
          update: {
            answerText: 'B-tree is suitable for comparison queries...',
            answeredAt: expect.any(Date),
          },
          include: {
            question: true,
          },
        });
      });

      it('should reject answering if attempt does not exist', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(null);

        await expect(
          repository.saveAnswer({
            assessmentAttemptId: 'missing-att',
            assessmentQuestionId: questionId,
            answerText: 'Sample',
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should reject modifying answers if attempt is already SUBMITTED', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockSubmittedAttempt);

        await expect(
          repository.saveAnswer({
            assessmentAttemptId: attemptId,
            assessmentQuestionId: questionId,
            answerText: 'Sample',
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject answering if attempt is NOT_STARTED', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue({
          ...mockAttempt,
          status: AssessmentAttemptStatus.NOT_STARTED,
        });

        await expect(
          repository.saveAnswer({
            assessmentAttemptId: attemptId,
            assessmentQuestionId: questionId,
            answerText: 'Sample',
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should reject answering if question does not exist', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);
        mockPrisma.assessmentQuestion.findUnique.mockResolvedValue(null);

        await expect(
          repository.saveAnswer({
            assessmentAttemptId: attemptId,
            assessmentQuestionId: 'missing-qst',
            answerText: 'Sample',
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should enforce Diamond 2 integrity and reject question belonging to a different assessment', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);
        mockPrisma.assessmentQuestion.findUnique.mockResolvedValue({
          ...mockQuestion,
          assessmentId: otherAssessmentId, // mismatch!
        });

        await expect(
          repository.saveAnswer({
            assessmentAttemptId: attemptId,
            assessmentQuestionId: questionId,
            answerText: 'Sample',
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('saveAnswers & findAnswersByAttemptId', () => {
      it('should batch save multiple answers', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);
        mockPrisma.assessmentQuestion.findUnique.mockResolvedValue(mockQuestion);
        mockPrisma.assessmentAnswer.upsert.mockResolvedValue(mockAnswer);

        const results = await repository.saveAnswers(attemptId, [
          { assessmentQuestionId: questionId, answerText: 'Answer 1' },
        ]);

        expect(results).toHaveLength(1);
        expect(mockPrisma.assessmentAnswer.upsert).toHaveBeenCalledTimes(1);
      });

      it('should retrieve answers ordered by question order asc', async () => {
        mockPrisma.assessmentAnswer.findMany.mockResolvedValue([mockAnswer]);

        const result = await repository.findAnswersByAttemptId(attemptId);
        expect(result).toEqual([mockAnswer]);
        expect(mockPrisma.assessmentAnswer.findMany).toHaveBeenCalledWith({
          where: { assessmentAttemptId: attemptId },
          include: { question: true },
          orderBy: { question: { questionOrder: 'asc' } },
        });
      });
    });
  });

  // ==========================================================================
  // 3. APPLICANT ANALYSIS DATA ACCESS (BACKEND 1 & 3 CONTRACT)
  // ==========================================================================

  describe('Applicant Analysis Data Access', () => {
    const mockFullApplicantData = {
      id: applicationId,
      studentProfileId,
      opportunityId,
      status: 'SUBMITTED',
      appliedAt: mockDate,
      studentProfile: {
        academicYear: 4,
        university: 'Addis Ababa University',
        fieldOfStudy: 'Computer Engineering',
        user: {
          id: studentProfileId,
          firstName: 'Abebe',
          lastName: 'Bikila',
        },
        skills: [{ proficiency: 4, skill: { name: 'PostgreSQL' } }],
        experiences: [],
        cvs: [],
      },
      opportunity: {
        id: opportunityId,
        title: 'Backend Engineer',
        organization: { name: 'Tech Corp' },
      },
      assessmentAttempt: {
        ...mockSubmittedAttempt,
        answers: [mockAnswer],
      },
    };

    it('should retrieve applicant analysis data for an application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(mockFullApplicantData);

      const result = await repository.getApplicantAnalysisData(applicationId);
      expect(result).toEqual(mockFullApplicantData);
      expect(mockPrisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: applicationId },
        include: expect.any(Object),
      });
    });

    it('should retrieve submitted applicant analysis data when attempt is SUBMITTED', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(mockFullApplicantData);

      const result = await repository.getSubmittedApplicantAnalysisData(applicationId);
      expect(result).toEqual(mockFullApplicantData);
      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
        where: {
          id: applicationId,
          assessmentAttempt: {
            status: AssessmentAttemptStatus.SUBMITTED,
          },
        },
        include: expect.any(Object),
      });
    });

    it('should return null when submitted applicant analysis data is requested for an unsubmitted attempt', async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);

      const result = await repository.getSubmittedApplicantAnalysisData(applicationId);
      expect(result).toBeNull();
    });

    it('should query eligible applicants for analysis strictly filtering for SUBMITTED attempts', async () => {
      mockPrisma.application.findMany.mockResolvedValue([mockFullApplicantData]);

      const results = await repository.findEligibleApplicantsForAnalysis(opportunityId);

      expect(results).toEqual([mockFullApplicantData]);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: {
          opportunityId,
          assessmentAttempt: {
            status: AssessmentAttemptStatus.SUBMITTED,
          },
        },
        include: expect.any(Object),
        orderBy: { appliedAt: 'desc' },
      });
    });
  });

  // ==========================================================================
  // 4. CANDIDATE ANALYSIS RESULT PERSISTENCE & RETRIEVAL
  // ==========================================================================

  describe('Candidate Analysis Results (AssessmentResult)', () => {
    describe('saveAssessmentResult', () => {
      it('should persist analysis result for a SUBMITTED attempt using AssessmentResult', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue({
          ...mockSubmittedAttempt,
          application: mockApplication,
        });
        mockPrisma.assessmentResult.upsert.mockResolvedValue(mockAssessmentResult);

        const result = await repository.saveAssessmentResult({
          assessmentAttemptId: attemptId,
          aiScore: 88,
          aiRequirementMatch: 'HIGH',
          aiSkillAnalysis: { technicalKnowledge: 90 },
          aiStrengths: ['Strong database indexing knowledge'],
          aiGaps: ['Could mention partial indexes'],
          aiSummary: 'Candidate demonstrated deep understanding of relational indexing.',
        });

        expect(result).toEqual(mockAssessmentResult);
        expect(mockPrisma.assessmentResult.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { assessmentAttemptId: attemptId },
            create: expect.objectContaining({
              assessmentAttemptId: attemptId,
              aiScore: 88,
              finalScore: 88,
              aiRequirementMatch: 'HIGH',
              finalSummary: 'Candidate demonstrated deep understanding of relational indexing.',
            }),
          }),
        );
      });

      it('should reject saving assessment result if attempt does not exist', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(null);

        await expect(
          repository.saveAssessmentResult({
            assessmentAttemptId: 'missing-att',
            aiScore: 85,
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should reject saving assessment result if attempt is not SUBMITTED (e.g. IN_PROGRESS)', async () => {
        mockPrisma.assessmentAttempt.findUnique.mockResolvedValue({
          ...mockAttempt, // status: IN_PROGRESS
          application: mockApplication,
        });

        await expect(
          repository.saveAssessmentResult({
            assessmentAttemptId: attemptId,
            aiScore: 85,
          }),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('findAssessmentResultsByOpportunityId & result retrieval', () => {
      it('should retrieve assessment result by result ID', async () => {
        mockPrisma.assessmentResult.findUnique.mockResolvedValue(mockAssessmentResult);

        const result = await repository.findAssessmentResultById(resultId);
        expect(result).toEqual(mockAssessmentResult);
      });

      it('should retrieve assessment result by attempt ID', async () => {
        mockPrisma.assessmentResult.findUnique.mockResolvedValue(mockAssessmentResult);

        const result = await repository.findAssessmentResultByAttemptId(attemptId);
        expect(result).toEqual(mockAssessmentResult);
      });

      it('should retrieve assessment result by application ID', async () => {
        mockPrisma.assessmentResult.findFirst.mockResolvedValue(mockAssessmentResult);

        const result = await repository.findAssessmentResultByApplicationId(applicationId);
        expect(result).toEqual(mockAssessmentResult);
      });

      it('should retrieve results by opportunity with filtering on minScore and sorting by finalScore desc', async () => {
        mockPrisma.assessmentResult.findMany.mockResolvedValue([mockAssessmentResult]);

        const results = await repository.findAssessmentResultsByOpportunityId(
          opportunityId,
          {
            minScore: 80,
            isFinalApproved: false,
            aiRequirementMatch: 'HIGH',
          },
        );

        expect(results).toEqual([mockAssessmentResult]);
        expect(mockPrisma.assessmentResult.findMany).toHaveBeenCalledWith({
          where: {
            attempt: {
              assessment: {
                opportunityId,
              },
            },
            isFinalApproved: false,
            aiRequirementMatch: 'HIGH',
            finalScore: {
              gte: 80,
            },
          },
          include: expect.any(Object),
          orderBy: { finalScore: 'desc' },
          skip: undefined,
          take: undefined,
        });
      });
    });
  });

  // ==========================================================================
  // 5. ASSESSMENTS SERVICE INTEGRATION TESTS
  // ==========================================================================

  describe('AssessmentsService Delegation', () => {
    it('should delegate startAttempt to repository', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(mockApplication);
      mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(null);
      mockPrisma.assessmentAttempt.create.mockResolvedValue(mockAttempt);

      const result = await service.startAttempt({
        applicationId,
        assessmentId,
      });

      expect(result).toEqual(mockAttempt);
    });

    it('should delegate submitAttempt to repository', async () => {
      mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);
      mockPrisma.assessmentAttempt.update.mockResolvedValue(mockSubmittedAttempt);

      const result = await service.submitAttempt(attemptId);
      expect(result).toEqual(mockSubmittedAttempt);
    });

    it('should delegate saveAnswer to repository', async () => {
      mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(mockAttempt);
      mockPrisma.assessmentQuestion.findUnique.mockResolvedValue(mockQuestion);
      mockPrisma.assessmentAnswer.upsert.mockResolvedValue(mockAnswer);

      const result = await service.saveAnswer({
        assessmentAttemptId: attemptId,
        assessmentQuestionId: questionId,
        answerText: 'Answer text',
      });
      expect(result).toEqual(mockAnswer);
    });

    it('should delegate getEligibleApplicantsForAnalysis to repository', async () => {
      mockPrisma.application.findMany.mockResolvedValue([mockSubmittedAttempt]);

      const result = await service.getEligibleApplicantsForAnalysis(opportunityId);
      expect(result).toEqual([mockSubmittedAttempt]);
    });

    it('should delegate saveAssessmentResult to repository', async () => {
      mockPrisma.assessmentAttempt.findUnique.mockResolvedValue({
        ...mockSubmittedAttempt,
        application: mockApplication,
      });
      mockPrisma.assessmentResult.upsert.mockResolvedValue(mockAssessmentResult);

      const result = await service.saveAssessmentResult({
        assessmentAttemptId: attemptId,
        aiScore: 88,
      });
      expect(result).toEqual(mockAssessmentResult);
    });
  });
});
