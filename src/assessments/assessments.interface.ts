import {
  AssessmentAttemptStatus,
  AssessmentQuestionType,
  AssessmentStatus,
  Prisma,
  SkillRequirementLevel,
} from '@prisma/client';

export interface CreateAssessmentQuestionData {
  questionText: string;
  questionType: AssessmentQuestionType;
  questionOrder: number;
  isAiGenerated?: boolean;
  options?: Prisma.InputJsonValue;
  referenceAnswer?: string | null;
  evaluationGuidance?: string | null;
  requirementLevel?: SkillRequirementLevel;
}

export interface CreateAssessmentData {
  opportunityId: string;
  title: string;
  instructions?: string | null;
  timeLimitMinutes?: number | null;
  status?: AssessmentStatus;
  questions?: CreateAssessmentQuestionData[];
}

export interface UpdateAssessmentData {
  title?: string;
  instructions?: string | null;
  timeLimitMinutes?: number | null;
  status?: AssessmentStatus;
}

export interface AssessmentFilterOptions {
  opportunityId?: string;
  status?: AssessmentStatus;
  skip?: number;
  take?: number;
}

export const assessmentWithQuestionsIncludes =
  Prisma.validator<Prisma.AssessmentInclude>()({
    opportunity: true,
    questions: {
      orderBy: {
        questionOrder: 'asc',
      },
    },
  });

export type AssessmentWithQuestions = Prisma.AssessmentGetPayload<{
  include: typeof assessmentWithQuestionsIncludes;
}>;

export type AssessmentWithRelations = Prisma.AssessmentGetPayload<{
  include: {
    opportunity: {
      include: {
        organization: true;
        skills: {
          include: {
            skill: true;
          };
        };
      };
    };
    questions: true;
    attempts: true;
  };
}>;

// ============================================================================
// DAY 13: ATTEMPTS, ANSWERS & CANDIDATE ANALYSIS RESULT TYPES
// ============================================================================

export interface CreateAssessmentAttemptData {
  applicationId: string;
  assessmentId: string;
  status?: AssessmentAttemptStatus;
}

export interface UpdateAssessmentAttemptData {
  status?: AssessmentAttemptStatus;
  startedAt?: Date | string | null;
  submittedAt?: Date | string | null;
}

export interface SaveAssessmentAnswerData {
  assessmentAttemptId: string;
  assessmentQuestionId: string;
  answerText: string;
}

export interface BatchSaveAssessmentAnswersData {
  assessmentAttemptId: string;
  answers: Array<{
    assessmentQuestionId: string;
    answerText: string;
  }>;
}

export interface SaveAssessmentResultData {
  assessmentAttemptId: string;
  aiScore?: number | null;
  aiRequirementMatch?: string | null;
  aiSkillAnalysis?: Prisma.InputJsonValue;
  aiStrengths?: string[];
  aiGaps?: string[];
  aiSummary?: string | null;
  aiEvaluatedAt?: Date | string | null;
  humanScore?: number | null;
  humanFeedback?: string | null;
  humanEvaluatorId?: string | null;
  humanEvaluatedAt?: Date | string | null;
  finalScore?: number;
  finalSummary?: string;
  finalStrengths?: string[];
  finalGaps?: string[];
  isFinalApproved?: boolean;
  approvedAt?: Date | string | null;
}

export interface AssessmentResultFilterOptions {
  opportunityId?: string;
  isFinalApproved?: boolean;
  minScore?: number;
  maxScore?: number;
  aiRequirementMatch?: string;
  skip?: number;
  take?: number;
  orderBy?: 'finalScore_desc' | 'finalScore_asc' | 'aiScore_desc' | 'aiScore_asc' | 'createdAt_desc' | 'createdAt_asc' | Prisma.AssessmentResultOrderByWithRelationInput;
}

export const assessmentAttemptWithAnswersIncludes =
  Prisma.validator<Prisma.AssessmentAttemptInclude>()({
    application: {
      include: {
        studentProfile: {
          include: {
            user: true,
          },
        },
        opportunity: true,
      },
    },
    assessment: true,
    answers: {
      include: {
        question: true,
      },
      orderBy: {
        question: {
          questionOrder: 'asc',
        },
      },
    },
    result: true,
  });

export type AssessmentAttemptWithAnswers = Prisma.AssessmentAttemptGetPayload<{
  include: typeof assessmentAttemptWithAnswersIncludes;
}>;

export const applicantAnalysisDataIncludes =
  Prisma.validator<Prisma.ApplicationInclude>()({
    studentProfile: {
      include: {
        user: true,
        skills: {
          include: {
            skill: true,
          },
        },
        experiences: {
          orderBy: {
            startDate: 'desc',
          },
        },
        cvs: {
          orderBy: [{ isDefault: 'desc' }, { uploadedAt: 'desc' }],
        },
      },
    },
    opportunity: {
      include: {
        organization: true,
        skills: {
          include: {
            skill: true,
          },
        },
      },
    },
    assessmentAttempt: {
      include: {
        assessment: {
          include: {
            questions: {
              orderBy: {
                questionOrder: 'asc',
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
          orderBy: {
            question: {
              questionOrder: 'asc',
            },
          },
        },
        result: true,
      },
    },
  });

export type ApplicantAnalysisData = Prisma.ApplicationGetPayload<{
  include: typeof applicantAnalysisDataIncludes;
}>;

export const assessmentResultWithRelationsIncludes =
  Prisma.validator<Prisma.AssessmentResultInclude>()({
    attempt: {
      include: {
        application: {
          include: {
            studentProfile: {
              include: {
                user: true,
                skills: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
            opportunity: {
              include: {
                organization: true,
              },
            },
          },
        },
        assessment: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    },
    humanEvaluator: true,
  });

export type AssessmentResultWithRelations = Prisma.AssessmentResultGetPayload<{
  include: typeof assessmentResultWithRelationsIncludes;
}>;

