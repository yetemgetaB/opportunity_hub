export type OpportunityType =
  | 'INTERNSHIP'
  | 'JOB'
  | 'SCHOLARSHIP'
  | 'HACKATHON'
  | 'COMPETITION'
  | 'TRAINING'
  | 'VOLUNTEER'
  | 'FELLOWSHIP'
  | 'OTHER'

export interface OpportunitySkill {
  name?: string
  requirementLevel?: string
  skill?: {
    name: string
  }
}

export interface OpportunityOrganization {
  id?: string
  name: string
  description?: string | null
  websiteUrl?: string | null
}

export interface PublicOpportunity {
  id: string
  title: string
  description?: string | null
  opportunityType?: OpportunityType
  organization?: OpportunityOrganization | string | null
  location?: string | null
  isRemote?: boolean
  applicationDeadline?: string | null
  minimumAcademicYear?: number | null
  maximumAcademicYear?: number | null
  minimumGpa?: number | string | null
  eligibleFields?: string[] | null
  compensation?: string | null
  applicationUrl?: string | null
  skills?: OpportunitySkill[] | null
}

export interface OrganizationOpportunity extends PublicOpportunity {
  opportunityType: OpportunityType
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'CLOSED' | 'REJECTED'
  isRemote: boolean
  eligibleFields: string[]
  createdAt?: string
  publishedAt?: string | null
}

export interface OpportunitySearchResult {
  id: string
  title: string
  skills: string[]
  eligibleFields: string[]
  location: string | null
  opportunityType: OpportunityType
  isRemote: boolean
}

export interface OpportunityUpdatePayload {
  title: string
  description: string
  opportunityType: OpportunityType
  location: string | null
  isRemote: boolean
  applicationDeadline: string | null
  eligibleFields: string[]
  minimumAcademicYear: number | null
  maximumAcademicYear: number | null
  minimumGpa: number | null
  compensation: string | null
  applicationUrl: string | null
}

export interface OpportunityFilters {
  search?: string
  type?: OpportunityType
  location?: string
  remote?: 'remote' | 'onsite'
  field?: string
  academicYear?: number
  skills?: string
}
