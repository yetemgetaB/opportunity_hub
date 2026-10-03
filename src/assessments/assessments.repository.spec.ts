import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  AssessmentQuestionType,
  AssessmentStatus,
  Prisma,
  SkillRequirementLevel,
} from '@prisma/client';
import { AssessmentsRepository } from './assessments.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('AssessmentsRepository', () => {
  let repository: AssessmentsRepository;
  let mockPrisma: any;

  const mockDate = new Date('2026-10-02T12:00:00Z');

  const baseAssessment = {
    id: 'assess-1111-1111-1111-111111111111',
    opportunityId: 'opp-2222-2222-2222-222222222222',
    title: 'Full Stack Screening Assessment',
    instructions: 'Please answer all questions within the allocated time limit.',
    timeLimitMinutes: 45,
    status: AssessmentStatus.DRAFT,
    createdAt: mockDate,
    updatedAt: mockDate,
    opportunity: {
      id: 'opp-2222-2222-2222-222222222222',
      title: 'Backend Engineer Intern',
    },
    questions: [],
  };

  const baseQuestion = {
    id: 'quest-3333-3333-3333-333333333333',
    assessmentId: 'assess-1111-1111-1111-111111111111',
    questionText: 'Explain the difference between SQL and NoSQL databases.',
    questionType: AssessmentQuestionType.TEXT,
    questionOrder: 1,
    isAiGenerated: true,
    options: null,
    referenceAnswer: 'SQL is relational, schema-enforced...',
    evaluationGuidance: 'Look for understanding of ACID vs BASE.',
    requirementLevel: SkillRequirementLevel.REQUIRED,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(async () => {
    mockPrisma = {
      assessment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      assessmentQuestion: {
        createMany: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<AssessmentsRepository>(AssessmentsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // ==========================================================================
  // 1. ASSESSMENT CREATION & RETRIEVAL TESTS
  // ==========================================================================

  describe('create', () => {
    it('should create an assessment with default status DRAFT', async () => {
      mockPrisma.assessment.create.mockResolvedValue(baseAssessment);

      const result = await repository.create({
        opportunityId: 'opp-2222-2222-2222-222222222222',
        title: 'Full Stack Screening Assessment',
        instructions: 'Please answer all questions.',
        timeLimitMinutes: 45,
      });

      expect(result).toEqual(baseAssessment);
      expect(mockPrisma.assessment.create).toHaveBeenCalledWith({
        data: {
          opportunity: {
            connect: { id: 'opp-2222-2222-2222-222222222222' },
          },
          title: 'Full Stack Screening Assessment',
          instructions: 'Please answer all questions.',
          timeLimitMinutes: 45,
          status: AssessmentStatus.DRAFT,
        },
        include: {
          opportunity: true,
          questions: {
            orderBy: {
              questionOrder: 'asc',
            },
          },
        },
      });
    });

    it('should create an assessment with nested initial questions', async () => {
      const assessmentWithNested = {
        ...baseAssessment,
        questions: [baseQuestion],
      };
      mockPrisma.assessment.create.mockResolvedValue(assessmentWithNested);

      const result = await repository.create({
        opportunityId: 'opp-2222-2222-2222-222222222222',
        title: 'Full Stack Screening Assessment',
        questions: [
          {
            questionText: 'What is TypeScript?',
            questionType: AssessmentQuestionType.TEXT,
            questionOrder: 1,
            isAiGenerated: true,
          },
        ],
      });

      expect(result).toEqual(assessmentWithNested);
      expect(mockPrisma.assessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            questions: {
              create: [
                expect.objectContaining({
                  questionText: 'What is TypeScript?',
                  questionType: AssessmentQuestionType.TEXT,
                  questionOrder: 1,
                  isAiGenerated: true,
                  requirementLevel: SkillRequirementLevel.REQUIRED,
                }),
              ],
            },
          }),
        }),
      );
    });

    it('should throw ConflictException on duplicate opportunity assessment (P2002)', async () => {
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        {
          code: 'P2002',
          clientVersion: '5.10.2',
        },
      );
      mockPrisma.assessment.create.mockRejectedValue(p2002Error);

      await expect(
        repository.create({
          opportunityId: 'opp-2222-2222-2222-222222222222',
          title: 'Assessment',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should find assessment by id', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(baseAssessment);

      const result = await repository.findById(baseAssessment.id);

      expect(result).toEqual(baseAssessment);
      expect(mockPrisma.assessment.findUnique).toHaveBeenCalledWith({
        where: { id: baseAssessment.id },
      });
    });
  });

  describe('findByOpportunityId', () => {
    it('should find assessment by opportunity id', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(baseAssessment);

      const result = await repository.findByOpportunityId(
        baseAssessment.opportunityId,
      );

      expect(result).toEqual(baseAssessment);
      expect(mockPrisma.assessment.findUnique).toHaveBeenCalledWith({
        where: { opportunityId: baseAssessment.opportunityId },
      });
    });
  });

  describe('findByIdWithQuestions', () => {
    it('should return assessment with questions ordered by questionOrder asc', async () => {
      const assessmentWithQuestions = {
        ...baseAssessment,
        questions: [baseQuestion],
      };
      mockPrisma.assessment.findUnique.mockResolvedValue(
        assessmentWithQuestions,
      );

      const result = await repository.findByIdWithQuestions(baseAssessment.id);

      expect(result).toEqual(assessmentWithQuestions);
      expect(mockPrisma.assessment.findUnique).toHaveBeenCalledWith({
        where: { id: baseAssessment.id },
        include: {
          opportunity: true,
          questions: {
            orderBy: {
              questionOrder: 'asc',
            },
          },
        },
      });
    });
  });

  describe('findByOpportunityIdWithQuestions', () => {
    it('should return assessment with questions by opportunityId', async () => {
      const assessmentWithQuestions = {
        ...baseAssessment,
        questions: [baseQuestion],
      };
      mockPrisma.assessment.findUnique.mockResolvedValue(
        assessmentWithQuestions,
      );

      const result = await repository.findByOpportunityIdWithQuestions(
        baseAssessment.opportunityId,
      );

      expect(result).toEqual(assessmentWithQuestions);
      expect(mockPrisma.assessment.findUnique).toHaveBeenCalledWith({
        where: { opportunityId: baseAssessment.opportunityId },
        include: {
          opportunity: true,
          questions: {
            orderBy: {
              questionOrder: 'asc',
            },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('should update assessment fields and status', async () => {
      const updated = {
        ...baseAssessment,
        title: 'Updated Title',
        status: AssessmentStatus.ACTIVE,
      };
      mockPrisma.assessment.findUnique.mockResolvedValue(baseAssessment);
      mockPrisma.assessment.update.mockResolvedValue(updated);

      const result = await repository.update(baseAssessment.id, {
        title: 'Updated Title',
        status: AssessmentStatus.ACTIVE,
      });

      expect(result.title).toBe('Updated Title');
      expect(result.status).toBe(AssessmentStatus.ACTIVE);
      expect(mockPrisma.assessment.update).toHaveBeenCalledWith({
        where: { id: baseAssessment.id },
        data: {
          title: 'Updated Title',
          status: AssessmentStatus.ACTIVE,
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if assessment does not exist', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(null);

      await expect(
        repository.update('non-existent-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================================================
  // 2. QUESTION PERSISTENCE & RETRIEVAL TESTS
  // ==========================================================================

  describe('createQuestions', () => {
    it('should batch insert questions and return ordered questions list', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(baseAssessment);
      mockPrisma.assessmentQuestion.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.assessmentQuestion.findMany.mockResolvedValue([baseQuestion]);

      const result = await repository.createQuestions(baseAssessment.id, [
        {
          questionText: baseQuestion.questionText,
          questionType: baseQuestion.questionType,
          questionOrder: 1,
          isAiGenerated: true,
        },
      ]);

      expect(result).toEqual([baseQuestion]);
      expect(mockPrisma.assessmentQuestion.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            assessmentId: baseAssessment.id,
            questionText: baseQuestion.questionText,
            questionType: baseQuestion.questionType,
            questionOrder: 1,
          }),
        ],
      });
    });

    it('should return empty array if empty questions array passed', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(baseAssessment);

      const result = await repository.createQuestions(baseAssessment.id, []);

      expect(result).toEqual([]);
      expect(mockPrisma.assessmentQuestion.createMany).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if target assessment does not exist', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(null);

      await expect(
        repository.createQuestions('non-existent-id', [
          {
            questionText: 'Q1',
            questionType: AssessmentQuestionType.TEXT,
            questionOrder: 1,
          },
        ]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate question order (P2002)', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(baseAssessment);
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        {
          code: 'P2002',
          clientVersion: '5.10.2',
        },
      );
      mockPrisma.assessmentQuestion.createMany.mockRejectedValue(p2002Error);

      await expect(
        repository.createQuestions(baseAssessment.id, [
          {
            questionText: 'Q1',
            questionType: AssessmentQuestionType.TEXT,
            questionOrder: 1,
          },
        ]),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('replaceQuestions', () => {
    it('should atomically delete existing questions and create new questions in a transaction', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(baseAssessment);
      mockPrisma.assessmentQuestion.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.assessmentQuestion.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.assessmentQuestion.findMany.mockResolvedValue([baseQuestion]);

      const result = await repository.replaceQuestions(baseAssessment.id, [
        {
          questionText: baseQuestion.questionText,
          questionType: baseQuestion.questionType,
          questionOrder: 1,
        },
      ]);

      expect(result).toEqual([baseQuestion]);
      expect(mockPrisma.assessmentQuestion.deleteMany).toHaveBeenCalledWith({
        where: { assessmentId: baseAssessment.id },
      });
      expect(mockPrisma.assessmentQuestion.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            assessmentId: baseAssessment.id,
            questionText: baseQuestion.questionText,
            questionOrder: 1,
          }),
        ],
      });
    });

    it('should throw NotFoundException if assessment does not exist', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(null);

      await expect(
        repository.replaceQuestions('non-existent-id', []),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findQuestionsByAssessmentId', () => {
    it('should retrieve questions ordered by questionOrder asc', async () => {
      mockPrisma.assessmentQuestion.findMany.mockResolvedValue([baseQuestion]);

      const result = await repository.findQuestionsByAssessmentId(
        baseAssessment.id,
      );

      expect(result).toEqual([baseQuestion]);
      expect(mockPrisma.assessmentQuestion.findMany).toHaveBeenCalledWith({
        where: { assessmentId: baseAssessment.id },
        orderBy: { questionOrder: 'asc' },
      });
    });
  });

  describe('delete', () => {
    it('should delete assessment and return deleted record', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(baseAssessment);
      mockPrisma.assessment.delete.mockResolvedValue(baseAssessment);

      const result = await repository.delete(baseAssessment.id);

      expect(result).toEqual(baseAssessment);
      expect(mockPrisma.assessment.delete).toHaveBeenCalledWith({
        where: { id: baseAssessment.id },
      });
    });

    it('should throw NotFoundException if assessment does not exist', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(null);

      await expect(
        repository.delete('non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
