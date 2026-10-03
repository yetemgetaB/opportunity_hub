import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Assessment,
  AssessmentQuestion,
  AssessmentStatus,
  Prisma,
  SkillRequirementLevel,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  assessmentWithQuestionsIncludes,
  AssessmentWithQuestions,
  CreateAssessmentData,
  CreateAssessmentQuestionData,
  UpdateAssessmentData,
} from './assessments.interface';

@Injectable()
export class AssessmentsRepository {
  private readonly logger = new Logger(AssessmentsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Common relation include object for assessment with its questions.
   * Questions are ordered deterministically by questionOrder ASC.
   */
  private readonly defaultWithQuestionsInclude = assessmentWithQuestionsIncludes;

  /**
   * Create a new screening assessment for an opportunity.
   * Enforces 1:1 relationship with Opportunity via database uniqueness.
   */
  async create(data: CreateAssessmentData): Promise<AssessmentWithQuestions> {
    try {
      const createPayload: Prisma.AssessmentCreateInput = {
        opportunity: {
          connect: { id: data.opportunityId },
        },
        title: data.title.trim(),
        instructions: data.instructions ? data.instructions.trim() : null,
        timeLimitMinutes: data.timeLimitMinutes ?? null,
        status: data.status ?? AssessmentStatus.DRAFT,
      };

      if (data.questions && data.questions.length > 0) {
        createPayload.questions = {
          create: data.questions.map((q) => ({
            questionText: q.questionText.trim(),
            questionType: q.questionType,
            questionOrder: q.questionOrder,
            isAiGenerated: q.isAiGenerated ?? false,
            options: q.options !== undefined ? q.options : Prisma.JsonNull,
            referenceAnswer: q.referenceAnswer ? q.referenceAnswer.trim() : null,
            evaluationGuidance: q.evaluationGuidance ? q.evaluationGuidance.trim() : null,
            requirementLevel: q.requirementLevel ?? SkillRequirementLevel.REQUIRED,
          })),
        };
      }

      const assessment = await this.prisma.assessment.create({
        data: createPayload,
        include: this.defaultWithQuestionsInclude,
      });

      this.logger.log(
        `Created assessment ${assessment.id} for opportunity ${data.opportunityId} [Status: ${assessment.status}]`,
      );

      return assessment;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'An assessment already exists for this opportunity.',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Opportunity with ID ${data.opportunityId} not found.`,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Look up an assessment by its primary identifier.
   */
  async findById(id: string): Promise<Assessment | null> {
    return this.prisma.assessment.findUnique({
      where: { id },
    });
  }

  /**
   * Look up an assessment by its associated opportunity ID.
   */
  async findByOpportunityId(opportunityId: string): Promise<Assessment | null> {
    return this.prisma.assessment.findUnique({
      where: { opportunityId },
    });
  }

  /**
   * Look up an assessment with its questions by assessment ID.
   * Questions are strictly ordered by questionOrder ASC.
   */
  async findByIdWithQuestions(
    id: string,
  ): Promise<AssessmentWithQuestions | null> {
    return this.prisma.assessment.findUnique({
      where: { id },
      include: this.defaultWithQuestionsInclude,
    });
  }

  /**
   * Look up an assessment with its questions by opportunity ID.
   * Questions are strictly ordered by questionOrder ASC.
   */
  async findByOpportunityIdWithQuestions(
    opportunityId: string,
  ): Promise<AssessmentWithQuestions | null> {
    return this.prisma.assessment.findUnique({
      where: { opportunityId },
      include: this.defaultWithQuestionsInclude,
    });
  }

  /**
   * Update assessment details or status.
   */
  async update(
    id: string,
    data: UpdateAssessmentData,
  ): Promise<AssessmentWithQuestions> {
    const existing = await this.prisma.assessment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Assessment with ID ${id} not found.`);
    }

    const updatePayload: Prisma.AssessmentUpdateInput = {};

    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.instructions !== undefined) {
      updatePayload.instructions = data.instructions ? data.instructions.trim() : null;
    }
    if (data.timeLimitMinutes !== undefined) {
      updatePayload.timeLimitMinutes = data.timeLimitMinutes;
    }
    if (data.status !== undefined) {
      updatePayload.status = data.status;
    }

    return this.prisma.assessment.update({
      where: { id },
      data: updatePayload,
      include: this.defaultWithQuestionsInclude,
    });
  }

  /**
   * Batch persist questions for an existing assessment.
   * Enforces deterministic questionOrder ASC.
   */
  async createQuestions(
    assessmentId: string,
    questions: CreateAssessmentQuestionData[],
  ): Promise<AssessmentQuestion[]> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found.`,
      );
    }

    if (questions.length === 0) {
      return [];
    }

    try {
      await this.prisma.assessmentQuestion.createMany({
        data: questions.map((q) => ({
          assessmentId,
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          questionOrder: q.questionOrder,
          isAiGenerated: q.isAiGenerated ?? false,
          options: q.options !== undefined ? q.options : Prisma.JsonNull,
          referenceAnswer: q.referenceAnswer ? q.referenceAnswer.trim() : null,
          evaluationGuidance: q.evaluationGuidance ? q.evaluationGuidance.trim() : null,
          requirementLevel: q.requirementLevel ?? SkillRequirementLevel.REQUIRED,
        })),
      });

      return this.findQuestionsByAssessmentId(assessmentId);
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Duplicate question order for this assessment.',
          );
        }
      }
      throw error;
    }
  }

  /**
   * Atomically replace all questions attached to an assessment using a Prisma transaction.
   * Useful when AI regenerates the assessment question set.
   */
  async replaceQuestions(
    assessmentId: string,
    questions: CreateAssessmentQuestionData[],
  ): Promise<AssessmentQuestion[]> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${assessmentId} not found.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Delete existing questions for this assessment
      await tx.assessmentQuestion.deleteMany({
        where: { assessmentId },
      });

      // 2. Insert new questions if provided
      if (questions.length > 0) {
        await tx.assessmentQuestion.createMany({
          data: questions.map((q) => ({
            assessmentId,
            questionText: q.questionText.trim(),
            questionType: q.questionType,
            questionOrder: q.questionOrder,
            isAiGenerated: q.isAiGenerated ?? false,
            options: q.options !== undefined ? q.options : Prisma.JsonNull,
            referenceAnswer: q.referenceAnswer ? q.referenceAnswer.trim() : null,
            evaluationGuidance: q.evaluationGuidance ? q.evaluationGuidance.trim() : null,
            requirementLevel: q.requirementLevel ?? SkillRequirementLevel.REQUIRED,
          })),
        });
      }

      // 3. Return full updated list ordered by questionOrder ASC
      return tx.assessmentQuestion.findMany({
        where: { assessmentId },
        orderBy: { questionOrder: 'asc' },
      });
    });
  }

  /**
   * Retrieve all questions for a specific assessment strictly ordered by questionOrder ASC.
   */
  async findQuestionsByAssessmentId(
    assessmentId: string,
  ): Promise<AssessmentQuestion[]> {
    return this.prisma.assessmentQuestion.findMany({
      where: { assessmentId },
      orderBy: { questionOrder: 'asc' },
    });
  }

  /**
   * Delete an assessment and cascade delete its questions.
   */
  async delete(id: string): Promise<Assessment> {
    const existing = await this.prisma.assessment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Assessment with ID ${id} not found.`);
    }

    return this.prisma.assessment.delete({
      where: { id },
    });
  }

  // ==========================================================================
  // BACKEND 1 COMPATIBILITY ADAPTERS
  // ==========================================================================

  /**
   * Compatibility adapter for Backend 1 assessment creation.
   * Delegates to create(data: CreateAssessmentData).
   */
  async createAssessment(
    opportunityId: string,
    title: string,
    instructions?: string,
    timeLimitMinutes?: number,
  ): Promise<AssessmentWithQuestions> {
    return this.create({
      opportunityId,
      title,
      instructions,
      timeLimitMinutes,
    });
  }

  /**
   * Compatibility adapter for Backend 1 assessment retrieval with questions.
   * Delegates to findByIdWithQuestions(id: string).
   */
  async getAssessment(
    assessmentId: string,
  ): Promise<AssessmentWithQuestions | null> {
    return this.findByIdWithQuestions(assessmentId);
  }

  /**
   * Compatibility adapter for Backend 1 assessment questions retrieval.
   * Delegates to findQuestionsByAssessmentId(assessmentId: string).
   */
  async getAssessmentQuestions(
    assessmentId: string,
  ): Promise<AssessmentQuestion[]> {
    return this.findQuestionsByAssessmentId(assessmentId);
  }
}

