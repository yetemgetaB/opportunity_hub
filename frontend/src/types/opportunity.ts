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

export interface Opportunity {
  id: string
  title: string
  organization: string
  type: string
  location: string
  deadline: string
}

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
  status?: string
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
  createdAt?: string
  publishedAt?: string | null
}

export interface OrganizationOpportunity extends PublicOpportunity {
  opportunityType: OpportunityType
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'CLOSED' | 'REJECTED'
  isRemote: boolean
  eligibleFields: string[]
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

export type OpportunitySort = 'newest' | 'deadline'

export interface OpportunityFilters {
  search?: string
  type?: OpportunityType
  location?: string
  remote?: 'remote' | 'onsite'
  field?: string
  academicYear?: number
  skills?: string
  sort?: OpportunitySort
}

export interface OpportunityListResult {
  items: PublicOpportunity[]
  total?: number
}
