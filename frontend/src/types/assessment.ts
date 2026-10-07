export type AssessmentQuestionType = 'TEXT' | 'MULTIPLE_CHOICE'

export type AssessmentQuestionOption =
  | string
  | {
      label: string
      value: string
    }

export interface StudentAssessmentQuestion {
  id: string
  questionText: string
  questionType: AssessmentQuestionType
  questionOrder: number
  options?: AssessmentQuestionOption[] | null
}

export interface StudentAssessment {
  id: string
  title: string
  instructions?: string | null
  timeLimitMinutes?: number | null
  questions: StudentAssessmentQuestion[]
}

export interface StudentAssessmentRouteState {
  assessment?: StudentAssessment
}
