import {
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
