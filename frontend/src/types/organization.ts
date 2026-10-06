import type { ApplicationStatus } from './application'

export type ApplicantStatus = ApplicationStatus

export interface ApplicantListItem {
  id: string
  studentId: string
  opportunityId: string
  name: string
  initials: string
  position: string
  university: string
  fieldOfStudy: string
  status: ApplicantStatus
  dateApplied: string
}

export interface RecentApplicant {
  id: string
  name: string
  initials: string
  position: string
  status: ApplicantStatus
}

export interface ActiveOpening {
  id: string
  title: string
  applicants: number
  deadline: string
  urgent?: boolean
}

export type OpportunityStatus = 'Published' | 'Pending Approval' | 'Rejected' | 'Closed' | 'Draft'

export interface OpportunityHistoryItem {
  id: string
  title: string
  type: string
  applicants: number
  postedDate: string
  status: OpportunityStatus
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  link?: string
  icon: string
  iconStyle: string
}
