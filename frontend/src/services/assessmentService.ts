import type { StudentAssessment, StudentAssessmentQuestion } from '../types/assessment'
import { apiRequest } from './api'

export interface AssessmentResult {
  id: string
  assessmentAttemptId: string
  aiScore: number | null
  aiRequirementMatch: string | null
  aiSkillAnalysis: unknown
  aiStrengths: string[]
  aiGaps: string[]
  aiSummary: string | null
  humanScore: number | null
  humanFeedback: string | null
  finalScore: number
  finalSummary: string
  finalStrengths: string[]
  finalGaps: string[]
  isFinalApproved: boolean
  attempt: {
    application: {
      id: string
      status: string
      studentProfile: {
        university: string
        fieldOfStudy: string
        user: { id: string; firstName: string; middleName: string | null; lastName: string }
        skills: { skill: { name: string } }[]
      }
      opportunity: { id: string; title: string }
    }
    assessment: { id: string; title: string }
  }
}

export interface CandidateResultsQuery {
  minScore?: number
  maxScore?: number
  isFinalApproved?: boolean
  orderBy?: 'finalScore_desc' | 'finalScore_asc' | 'aiScore_desc' | 'aiScore_asc' | 'createdAt_desc' | 'createdAt_asc'
  skip?: number
  take?: number
}

function toQuery(query: CandidateResultsQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value))
  }
  return params.size ? `?${params.toString()}` : ''
}

export const assessmentService = {
  createForOpportunity(opportunityId: string): Promise<StudentAssessment> {
    return apiRequest<StudentAssessment>(`/opportunities/${encodeURIComponent(opportunityId)}/assessment`, { method: 'POST' })
  },

  getAssessment(id: string): Promise<StudentAssessment> {
    return apiRequest<StudentAssessment>(`/assessments/${encodeURIComponent(id)}`)
  },

  getQuestions(id: string): Promise<StudentAssessmentQuestion[]> {
    return apiRequest<StudentAssessmentQuestion[]>(`/assessments/${encodeURIComponent(id)}/questions`)
  },

  analyzeApplicants(opportunityId: string): Promise<{ opportunityId: string; eligibleApplicants: unknown[]; totalEligibleApplicants: number }> {
    return apiRequest(`/opportunities/${encodeURIComponent(opportunityId)}/analyze-applicants`, { method: 'POST' })
  },

  getCandidateResults(opportunityId: string, query: CandidateResultsQuery = {}): Promise<AssessmentResult[]> {
    return apiRequest<AssessmentResult[]>(
      `/opportunities/${encodeURIComponent(opportunityId)}/candidate-results${toQuery(query)}`,
    )
  },
}
