export type DeadlineStatus = 'saved' | 'in progress'

export interface MatchBreakdownItem {
  label: string
  value: number
}

export interface Opportunity {
  id: string
  company: string
  location: string
  tagline: string
  title: string
  description: string
  tags: string[]
  type: string
  fit: number
  deadline: string
  overview: string
  requirements: string[]
  benefits: string[]
  matchBreakdown: MatchBreakdownItem[]
  recommended?: boolean
}

export interface Deadline {
  id: string
  title: string
  company: string
  location: string
  type: string
  due: string
  status: DeadlineStatus
  urgent?: boolean
}

export interface ActivityItem {
  id: string
  icon: 'file' | 'sparkles' | 'bookmark'
  title: string
  time: string
  text: string
}

export interface ProfileFormState {
  university: string
  degree: string
  gpa: string
  graduationDate: string
  bio: string
  interests: string
  preferredLocations: string
  opportunityTypes: string
  technicalSkills: string[]
  softSkills: string[]
  cvFileName: string | null
  portfolioMode: 'project' | 'portfolio'
  projectFileName: string | null
  portfolioUrl: string
}

export interface StudentNotificationPreference {
  id: string
  label: string
  description: string
  enabled: boolean
}

export interface StudentVisibilityPreference {
  id: string
  label: string
  description: string
  enabled: boolean
}