import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Assessment,
  AssessmentAnswer,
  AssessmentAttempt,
  AssessmentAttemptStatus,
  AssessmentQuestion,
  AssessmentStatus,
  Prisma,
  SkillRequirementLevel,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  applicantAnalysisDataIncludes,
  ApplicantAnalysisData,
  assessmentAttemptWithAnswersIncludes,
  AssessmentAttemptWithAnswers,
  assessmentResultWithRelationsIncludes,
  AssessmentResultWithRelations,
  assessmentWithQuestionsIncludes,
  AssessmentWithQuestions,
  AssessmentResultFilterOptions,
  CreateAssessmentAttemptData,
  CreateAssessmentData,
  CreateAssessmentQuestionData,
  SaveAssessmentAnswerData,
  SaveAssessmentResultData,
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

  // ==========================================================================
  // DAY 13: ASSESSMENT ATTEMPT PERSISTENCE & LIFECYCLE
  // ==========================================================================

  /**
   * Create/start an assessment attempt for an application.
   * Enforces:
   * - 1:1 relationship between application and attempt (uq_assessment_attempts_app)
   * - Diamond 1 integrity: application.opportunityId === assessment.opportunityId
   * - Status initialized to IN_PROGRESS (or NOT_STARTED)
   */
  async createAttempt(
    data: CreateAssessmentAttemptData,
  ): Promise<AssessmentAttempt> {
    const application = await this.prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { opportunity: true },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${data.applicationId} not found.`,
      );
    }

    const assessment = await this.prisma.assessment.findUnique({
      where: { id: data.assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException(
        `Assessment with ID ${data.assessmentId} not found.`,
      );
    }

    // Enforce Diamond 1 Integrity: Application and Assessment must belong to the exact same Opportunity
    if (application.opportunityId !== assessment.opportunityId) {
      throw new BadRequestException(
        `Diamond Integrity Violation: Application and Assessment must belong to the exact same Opportunity. (application opportunity: ${application.opportunityId}, assessment opportunity: ${assessment.opportunityId})`,
      );
    }

    // Check existing attempt (strictly 1 attempt per application in MVP)
    const existing = await this.prisma.assessmentAttempt.findUnique({
      where: { applicationId: data.applicationId },
    });

    if (existing) {
      throw new ConflictException(
        'An assessment attempt already exists for this application.',
      );
    }

    const status = data.status ?? AssessmentAttemptStatus.IN_PROGRESS;
    const now = new Date();

    try {
      const attempt = await this.prisma.assessmentAttempt.create({
        data: {
          application: { connect: { id: data.applicationId } },
          assessment: { connect: { id: data.assessmentId } },
          status,
          startedAt: status === AssessmentAttemptStatus.IN_PROGRESS ? now : null,
        },
      });

      this.logger.log(
        `Created attempt ${attempt.id} for application ${data.applicationId} [Assessment: ${data.assessmentId}, Status: ${attempt.status}]`,
      );

      return attempt;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'An assessment attempt already exists for this application.',
          );
        }
      }
      throw error;
    }
  }

  /**
   * Look up an assessment attempt by ID.
   */
  async findAttemptById(id: string): Promise<AssessmentAttempt | null> {
    return this.prisma.assessmentAttempt.findUnique({
      where: { id },
    });
  }

  /**
   * Look up an assessment attempt with its application, assessment, questions, answers, and result.
   */
  async findAttemptByIdWithAnswers(
    id: string,
  ): Promise<AssessmentAttemptWithAnswers | null> {
    return this.prisma.assessmentAttempt.findUnique({
      where: { id },
      include: assessmentAttemptWithAnswersIncludes,
    });
  }

  /**
   * Look up an attempt by application ID.
   */
  async findAttemptByApplicationId(
    applicationId: string,
  ): Promise<AssessmentAttemptWithAnswers | null> {
    return this.prisma.assessmentAttempt.findUnique({
      where: { applicationId },
      include: assessmentAttemptWithAnswersIncludes,
    });
  }

  /**
   * Submit an assessment attempt.
   * Transitions status to SUBMITTED and sets submittedAt timestamp.
   * Rejects if attempt is already SUBMITTED.
   */
  async submitAttempt(id: string): Promise<AssessmentAttempt> {
    const existing = await this.prisma.assessmentAttempt.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Assessment attempt with ID ${id} not found.`);
    }

    if (existing.status === AssessmentAttemptStatus.SUBMITTED) {
      throw new ConflictException(
        'Assessment attempt has already been submitted.',
      );
    }

    const now = new Date();
    const startedAt = existing.startedAt ?? now;

    return this.prisma.assessmentAttempt.update({
      where: { id },
      data: {
        status: AssessmentAttemptStatus.SUBMITTED,
        startedAt,
        submittedAt: now,
      },
    });
  }

  /**
   * Retrieve all submitted attempts for a specific assessment.
   * Strictly filters for status = SUBMITTED.
   */
  async findSubmittedAttemptsByAssessmentId(
    assessmentId: string,
  ): Promise<AssessmentAttemptWithAnswers[]> {
    return this.prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        status: AssessmentAttemptStatus.SUBMITTED,
      },
      include: assessmentAttemptWithAnswersIncludes,
      orderBy: { submittedAt: 'desc' },
    });
  }

  /**
   * Retrieve all submitted attempts for an opportunity.
   * Strictly filters for status = SUBMITTED.
   */
  async findSubmittedAttemptsByOpportunityId(
    opportunityId: string,
  ): Promise<AssessmentAttemptWithAnswers[]> {
    return this.prisma.assessmentAttempt.findMany({
      where: {
        assessment: {
          opportunityId,
        },
        status: AssessmentAttemptStatus.SUBMITTED,
      },
      include: assessmentAttemptWithAnswersIncludes,
      orderBy: { submittedAt: 'desc' },
    });
  }

  // ==========================================================================
  // DAY 13: ASSESSMENT ANSWER PERSISTENCE & INTEGRITY
  // ==========================================================================

  /**
   * Persist a candidate answer to a question within an attempt.
   * Enforces:
   * - Attempt must exist and be IN_PROGRESS (cannot answer if NOT_STARTED or SUBMITTED)
   * - Diamond 2 integrity: question must belong to the exact same assessment as the attempt
   * - Upserts answer for idempotency and student answer updates during active attempts
   */
  async saveAnswer(data: SaveAssessmentAnswerData): Promise<AssessmentAnswer> {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: data.assessmentAttemptId },
    });

    if (!attempt) {
      throw new NotFoundException(
        `Assessment attempt with ID ${data.assessmentAttemptId} not found.`,
      );
    }

    if (attempt.status === AssessmentAttemptStatus.SUBMITTED) {
      throw new BadRequestException(
        'Cannot modify answers for a submitted assessment attempt.',
      );
    }

    if (attempt.status === AssessmentAttemptStatus.NOT_STARTED) {
      throw new BadRequestException(
        'Cannot answer questions for an attempt that has not been started.',
      );
    }

    const question = await this.prisma.assessmentQuestion.findUnique({
      where: { id: data.assessmentQuestionId },
    });

    if (!question) {
      throw new NotFoundException(
        `Assessment question with ID ${data.assessmentQuestionId} not found.`,
      );
    }

    // Enforce Diamond 2 Integrity: Question must belong to the exact same assessment as the attempt
    if (question.assessmentId !== attempt.assessmentId) {
      throw new BadRequestException(
        'Diamond Integrity Violation: Question does not belong to the assessment for this attempt.',
      );
    }

    const now = new Date();

    return this.prisma.assessmentAnswer.upsert({
      where: {
        assessmentAttemptId_assessmentQuestionId: {
          assessmentAttemptId: data.assessmentAttemptId,
          assessmentQuestionId: data.assessmentQuestionId,
        },
      },
      create: {
        assessmentAttemptId: data.assessmentAttemptId,
        assessmentQuestionId: data.assessmentQuestionId,
        assessmentId: attempt.assessmentId,
        answerText: data.answerText.trim(),
        answeredAt: now,
      },
      update: {
        answerText: data.answerText.trim(),
        answeredAt: now,
      },
      include: {
        question: true,
      },
    });
  }

  /**
   * Batch save answers for an attempt.
   */
  async saveAnswers(
    attemptId: string,
    answers: Array<{ assessmentQuestionId: string; answerText: string }>,
  ): Promise<AssessmentAnswer[]> {
    const results: AssessmentAnswer[] = [];
    for (const ans of answers) {
      const saved = await this.saveAnswer({
        assessmentAttemptId: attemptId,
        assessmentQuestionId: ans.assessmentQuestionId,
        answerText: ans.answerText,
      });
      results.push(saved);
    }
    return results;
  }

  /**
   * Retrieve all answers for a specific attempt, ordered deterministically by questionOrder ASC.
   */
  async findAnswersByAttemptId(
    attemptId: string,
  ): Promise<AssessmentAnswer[]> {
    return this.prisma.assessmentAnswer.findMany({
      where: { assessmentAttemptId: attemptId },
      include: {
        question: true,
      },
      orderBy: {
        question: {
          questionOrder: 'asc',
        },
      },
    });
  }

  // ==========================================================================
  // DAY 13: APPLICANT ANALYSIS DATA ACCESS (BACKEND 1 & 3 CONTRACT)
  // ==========================================================================

  /**
   * Retrieve full applicant analysis data for an application:
   * Opportunity -> Application -> StudentProfile -> User, Skills, Experiences, CVs
   * -> Assessment -> Attempt -> Answers (with Questions) -> Result
   */
  async getApplicantAnalysisData(
    applicationId: string,
  ): Promise<ApplicantAnalysisData | null> {
    return this.prisma.application.findUnique({
      where: { id: applicationId },
      include: applicantAnalysisDataIncludes,
    });
  }

  /**
   * Retrieve full applicant analysis data specifically requiring attempt to be SUBMITTED.
   * Returns null if attempt is missing or not yet submitted.
   */
  async getSubmittedApplicantAnalysisData(
    applicationId: string,
  ): Promise<ApplicantAnalysisData | null> {
    return this.prisma.application.findFirst({
      where: {
        id: applicationId,
        assessmentAttempt: {
          status: AssessmentAttemptStatus.SUBMITTED,
        },
      },
      include: applicantAnalysisDataIncludes,
    });
  }

  /**
   * Retrieve all eligible applicants for an opportunity ready for AI analysis.
   * Strictly filters for applications whose assessmentAttempt.status === SUBMITTED.
   * Incomplete attempts (NOT_STARTED, IN_PROGRESS) are strictly excluded.
   */
  async findEligibleApplicantsForAnalysis(
    opportunityId: string,
  ): Promise<ApplicantAnalysisData[]> {
    return this.prisma.application.findMany({
      where: {
        opportunityId,
        assessmentAttempt: {
          status: AssessmentAttemptStatus.SUBMITTED,
        },
      },
      include: applicantAnalysisDataIncludes,
      orderBy: { appliedAt: 'desc' },
    });
  }

  // ==========================================================================
  // DAY 13: CANDIDATE ANALYSIS RESULT PERSISTENCE & RETRIEVAL
  // ==========================================================================

  /**
   * Persist candidate analysis result using the authoritative AssessmentResult model.
   * Enforces:
   * - Attempt must exist and be SUBMITTED before evaluation results can be saved
   * - 1:1 attempt-to-result mapping (uq_assessment_results_attempt)
   * - Preserves AI provenance, human review fields, and authoritative final score/summary
   * - Handles retry/re-analysis gracefully via upsert
   */
  async saveAssessmentResult(
    data: SaveAssessmentResultData,
  ): Promise<AssessmentResultWithRelations> {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: data.assessmentAttemptId },
      include: { application: true },
    });

    if (!attempt) {
      throw new NotFoundException(
        `Assessment attempt with ID ${data.assessmentAttemptId} not found.`,
      );
    }

    if (attempt.status !== AssessmentAttemptStatus.SUBMITTED) {
      throw new BadRequestException(
        'Cannot persist evaluation result for an unsubmitted assessment attempt.',
      );
    }

    const now = new Date();
    const finalScore = data.finalScore ?? data.aiScore ?? 0;
    const finalSummary =
      data.finalSummary ?? data.aiSummary ?? 'AI Evaluation Completed';
    const finalStrengths = data.finalStrengths ?? data.aiStrengths ?? [];
    const finalGaps = data.finalGaps ?? data.aiGaps ?? [];

    return this.prisma.assessmentResult.upsert({
      where: { assessmentAttemptId: data.assessmentAttemptId },
      create: {
        assessmentAttemptId: data.assessmentAttemptId,
        aiScore: data.aiScore ?? null,
        aiRequirementMatch: data.aiRequirementMatch ?? null,
        aiSkillAnalysis:
          data.aiSkillAnalysis !== undefined
            ? data.aiSkillAnalysis
            : Prisma.JsonNull,
        aiStrengths: data.aiStrengths ?? [],
        aiGaps: data.aiGaps ?? [],
        aiSummary: data.aiSummary ?? null,
        aiEvaluatedAt: data.aiEvaluatedAt
          ? new Date(data.aiEvaluatedAt)
          : data.aiScore !== undefined || data.aiSummary
            ? now
            : null,
        humanScore: data.humanScore ?? null,
        humanFeedback: data.humanFeedback ?? null,
        humanEvaluatorId: data.humanEvaluatorId ?? null,
        humanEvaluatedAt: data.humanEvaluatedAt
          ? new Date(data.humanEvaluatedAt)
          : null,
        finalScore,
        finalSummary,
        finalStrengths,
        finalGaps,
        isFinalApproved: data.isFinalApproved ?? false,
        approvedAt: data.approvedAt ? new Date(data.approvedAt) : null,
      },
      update: {
        ...(data.aiScore !== undefined && { aiScore: data.aiScore }),
        ...(data.aiRequirementMatch !== undefined && {
          aiRequirementMatch: data.aiRequirementMatch,
        }),
        ...(data.aiSkillAnalysis !== undefined && {
          aiSkillAnalysis: data.aiSkillAnalysis,
        }),
        ...(data.aiStrengths !== undefined && {
          aiStrengths: data.aiStrengths,
        }),
        ...(data.aiGaps !== undefined && { aiGaps: data.aiGaps }),
        ...(data.aiSummary !== undefined && { aiSummary: data.aiSummary }),
        ...(data.aiEvaluatedAt !== undefined && {
          aiEvaluatedAt: data.aiEvaluatedAt ? new Date(data.aiEvaluatedAt) : null,
        }),
        ...(data.humanScore !== undefined && { humanScore: data.humanScore }),
        ...(data.humanFeedback !== undefined && {
          humanFeedback: data.humanFeedback,
        }),
        ...(data.humanEvaluatorId !== undefined && {
          humanEvaluatorId: data.humanEvaluatorId,
        }),
        ...(data.humanEvaluatedAt !== undefined && {
          humanEvaluatedAt: data.humanEvaluatedAt
            ? new Date(data.humanEvaluatedAt)
            : null,
        }),
        ...(data.finalScore !== undefined && { finalScore: data.finalScore }),
        ...(data.finalSummary !== undefined && {
          finalSummary: data.finalSummary,
        }),
        ...(data.finalStrengths !== undefined && {
          finalStrengths: data.finalStrengths,
        }),
        ...(data.finalGaps !== undefined && { finalGaps: data.finalGaps }),
        ...(data.isFinalApproved !== undefined && {
          isFinalApproved: data.isFinalApproved,
        }),
        ...(data.approvedAt !== undefined && {
          approvedAt: data.approvedAt ? new Date(data.approvedAt) : null,
        }),
      },
      include: assessmentResultWithRelationsIncludes,
    });
  }

  /**
   * Retrieve an assessment result by result ID.
   */
  async findAssessmentResultById(
    id: string,
  ): Promise<AssessmentResultWithRelations | null> {
    return this.prisma.assessmentResult.findUnique({
      where: { id },
      include: assessmentResultWithRelationsIncludes,
    });
  }

  /**
   * Retrieve an assessment result by assessment attempt ID.
   */
  async findAssessmentResultByAttemptId(
    assessmentAttemptId: string,
  ): Promise<AssessmentResultWithRelations | null> {
    return this.prisma.assessmentResult.findUnique({
      where: { assessmentAttemptId },
      include: assessmentResultWithRelationsIncludes,
    });
  }

  /**
   * Retrieve an assessment result by application ID.
   */
  async findAssessmentResultByApplicationId(
    applicationId: string,
  ): Promise<AssessmentResultWithRelations | null> {
    return this.prisma.assessmentResult.findFirst({
      where: {
        attempt: {
          applicationId,
        },
      },
      include: assessmentResultWithRelationsIncludes,
    });
  }

  /**
   * Retrieve assessment results for an opportunity with filtering & sorting.
   * Supports:
   * - minScore, maxScore
   * - isFinalApproved
   * - aiRequirementMatch
   * - deterministic ordering (default: finalScore DESC)
   */
  async findAssessmentResultsByOpportunityId(
    opportunityId: string,
    options?: AssessmentResultFilterOptions,
  ): Promise<AssessmentResultWithRelations[]> {
    const where: Prisma.AssessmentResultWhereInput = {
      attempt: {
        assessment: {
          opportunityId,
        },
      },
    };

    if (options?.isFinalApproved !== undefined) {
      where.isFinalApproved = options.isFinalApproved;
    }

    if (options?.minScore !== undefined || options?.maxScore !== undefined) {
      where.finalScore = {};
      if (options.minScore !== undefined) where.finalScore.gte = options.minScore;
      if (options.maxScore !== undefined) where.finalScore.lte = options.maxScore;
    }

    if (options?.aiRequirementMatch) {
      where.aiRequirementMatch = options.aiRequirementMatch;
    }

    let orderBy: Prisma.AssessmentResultOrderByWithRelationInput = {
      finalScore: 'desc',
    };

    if (options?.orderBy) {
      if (typeof options.orderBy === 'string') {
        switch (options.orderBy) {
          case 'finalScore_desc':
            orderBy = { finalScore: 'desc' };
            break;
          case 'finalScore_asc':
            orderBy = { finalScore: 'asc' };
            break;
          case 'aiScore_desc':
            orderBy = { aiScore: 'desc' };
            break;
          case 'aiScore_asc':
            orderBy = { aiScore: 'asc' };
            break;
          case 'createdAt_desc':
            orderBy = { createdAt: 'desc' };
            break;
          case 'createdAt_asc':
            orderBy = { createdAt: 'asc' };
            break;
        }
      } else {
        orderBy = options.orderBy;
      }
    }

    return this.prisma.assessmentResult.findMany({
      where,
      include: assessmentResultWithRelationsIncludes,
      orderBy,
      skip: options?.skip,
      take: options?.take,
    });
  }
}


