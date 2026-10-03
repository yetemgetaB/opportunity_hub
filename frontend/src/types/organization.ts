
export interface RecentApplicant {
  id: string
  name: string
  initials: string
  position: string
  match: number
  status: ApplicantStatus
}

export interface ActiveOpening {
  id: string
  title: string
  applicants: number
  deadline: string
  urgent?: boolean
}

export interface PostOpportunityFormState {
  title: string
  type: string
  description: string
  location: string
  field: string
  requiredSkills: string[]
  preferredSkills: string[]
  educationLevel: string
  experienceLevel: string
  responsibilities: string
  applicationDeadline: string
  maxApplicants: string
}

export type OpportunityStatus = 'Active' | 'Closed' | 'Draft'

export interface OpportunityHistoryItem {
  id: string
  title: string
  type: string
  applicants: number
  postedDate: string
  status: OpportunityStatus
}

export type ApplicantStatus = 'Under Review' | 'Interview' | 'Shortlisted' | 'Accepted'
export type MatchTier = 'Excellent Fit' | 'High Fit' | 'Good Fit'

export interface ApplicantListItem {
  id: string
  name: string
  initials: string
  matchScore: number
  matchTier: MatchTier
  skillsMatch: number
  status: ApplicantStatus
  dateApplied: string
}

export interface TimelineEvent {
  id: string
  label: string
  date: string
  done: boolean
}

export interface ApplicantProfileDetail {
  id: string
  name: string
  initials: string
  year: string
  university: string
  track: string
  biography: string
  technicalSkills: string[]
  experienceTitle: string
  experienceCompany: string
  experiencePeriod: string
  careerGoals: string
  timeline: TimelineEvent[]
}

export interface EvaluationBreakdownItem {
  label: string
  value: number
}

export interface AssessmentEvaluation {
  applicantId: string
  applicantName: string
  initials: string
  university: string
  degree: string
  matchScore: number
  recommendationLabel: string
  breakdown: EvaluationBreakdownItem[]
  keyStrengths: string[]
  areasToImprove: string[]
  summary: string
}

export interface OrganizationProfileFormState {
  name: string
  industry: string
  website: string
  headquarters: string
  teamSize: string
  about: string
  focusAreas: string[]
  contactName: string
  contactRole: string
  contactEmail: string
  contactPhone: string
  linkedin: string
  twitter: string
  logoFileName: string | null
}

export interface TeamMember {
  id: string
  name: string
  initials: string
  email: string
  role: 'Admin' | 'Member'
}

export interface NotificationPreference {
  id: string
  label: string
  description: string
  enabled: boolean
}

export type NotificationCategory = 'applicant' | 'assessment' | 'system'

export interface NotificationItem {
  id: string
  category: NotificationCategory
  icon: IconNameForNotification
  iconStyle: string
  title: string
  description: string
  time: string
  read: boolean
  link?: string
}

export type IconNameForNotification = 'userPlus' | 'sparkles' | 'calendarEvent' | 'clock' | 'settings'