export {}
export type ApplicationStatus =
  | 'Under Review'
  | 'Interview'
  | 'Shortlisted'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn'

export interface ApplicationItem {
  id: string
  title: string
  company: string
  location: string
  appliedDate: string
  matchScore: number
  status: ApplicationStatus
  opportunityId?: string // set when a matching posting exists in the browse list
}