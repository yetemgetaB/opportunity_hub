export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'WITHDRAWN'

export interface ApplicationOpportunitySummary {
  id: string
  title: string
  opportunityType?: string
  location?: string | null
  organization?: { id?: string; name?: string } | string | null
}

export interface ApplicationItem {
  id: string
  opportunityId: string
  studentProfileId?: string
  status: ApplicationStatus
  appliedAt?: string
  opportunity?: ApplicationOpportunitySummary
}