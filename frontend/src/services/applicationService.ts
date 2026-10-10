import type { ApplicationItem, ApplicationStatus } from '../types/application'
import { apiRequest } from './api'

export interface OpportunityApplicant {
  application: {
    id: string
    status: ApplicationStatus
    appliedAt: string
    updatedAt: string
  }
  student: {
    id: string
    firstName: string
    middleName: string | null
    lastName: string
    avatarUrl: string | null
    profile: {
      academicYear: number
      university: string
      fieldOfStudy: string
      location: string | null
      careerGoals: string | null
      careerGoalTags: string[]
      interests: string[]
    }
    skills: {
      skillId: string
      name: string
      category: string | null
      description: string | null
      proficiency: string | null
      yearsOfExperience: number | null
    }[]
    experiences: {
      id: string
      title: string
      organizationName: string
      experienceType: string
      startDate: string
      endDate: string | null
      location: string | null
      description: string | null
    }[]
    cvs: {
      id: string
      fileName: string
      fileType: string
      fileSize: number
      isDefault: boolean
      uploadedAt: string
    }[]
  }
}

export interface SavedOpportunityRecord {
  id?: string
  opportunityId?: string
  savedAt?: string
  opportunity?: {
    id?: string
  }
}

export interface OrganizationSummaryResponse {
  stats: {
    publishedCount: number
    draftCount: number
    totalOpportunities: number
    totalApplicants: number
  }
  openings: {
    id: string
    title: string
    applicants: number
    deadline: string
    urgent: boolean
  }[]
  recentApplicants: {
    id: string
    name: string
    initials: string
    position: string
    status: ApplicationStatus
    dateApplied: string
  }[]
}

export interface OrganizationApplicantRecord extends OpportunityApplicant {
  opportunity?: {
    id: string
    title: string
    status: string
    opportunityType?: string
    location?: string | null
    isRemote?: boolean
    applicationDeadline?: string | null
    eligibleFields?: string[]
    compensation?: string | null
    applicationUrl?: string | null
  }
}

// Client-side quick cache for instant responsiveness (<50ms)
let cachedSummary: { data: OrganizationSummaryResponse; timestamp: number } | null = null
let cachedOrgApplicants: { data: OrganizationApplicantRecord[]; timestamp: number } | null = null
const applicantDetailCache = new Map<string, { data: OrganizationApplicantRecord; timestamp: number }>()
const ORG_CACHE_TTL = 30 * 1000 // 30 seconds fresh window

export const applicationService = {
  apply(opportunityId: string): Promise<ApplicationItem> {
    return apiRequest<ApplicationItem>(`/opportunities/${encodeURIComponent(opportunityId)}/apply`, {
      method: 'POST',
    }).then((res) => {
      cachedSummary = null
      cachedOrgApplicants = null
      return res
    })
  },

  getMyApplications(): Promise<ApplicationItem[]> {
    return apiRequest<ApplicationItem[]>('/opportunities/applications')
  },

  withdrawApplication(applicationId: string): Promise<ApplicationItem> {
    return apiRequest<ApplicationItem>(`/opportunities/applications/${encodeURIComponent(applicationId)}/withdraw`, {
      method: 'PATCH',
    }).then((res) => {
      cachedSummary = null
      cachedOrgApplicants = null
      return res
    })
  },

  getSavedOpportunities(): Promise<string[]> {
    return apiRequest<SavedOpportunityRecord[]>('/opportunities/saved').then((items) =>
      items
        .map((item) => item.opportunityId ?? item.opportunity?.id ?? item.id)
        .filter((id): id is string => Boolean(id)),
    )
  },

  saveOpportunity(opportunityId: string): Promise<unknown> {
    return apiRequest(`/opportunities/${encodeURIComponent(opportunityId)}/save`, { method: 'POST' })
  },

  unsaveOpportunity(opportunityId: string): Promise<{ message: string; deleted: boolean }> {
    return apiRequest(`/opportunities/${encodeURIComponent(opportunityId)}/save`, { method: 'DELETE' })
  },

  getApplicants(opportunityId: string): Promise<OpportunityApplicant[]> {
    return apiRequest<OpportunityApplicant[]>(`/opportunities/${encodeURIComponent(opportunityId)}/applicants`)
  },

  getOrganizationSummary(bypassCache = false): Promise<OrganizationSummaryResponse> {
    if (!bypassCache && cachedSummary && Date.now() - cachedSummary.timestamp < ORG_CACHE_TTL) {
      return Promise.resolve(cachedSummary.data)
    }
    return apiRequest<OrganizationSummaryResponse>('/opportunities/organization/summary').then((data) => {
      cachedSummary = { data, timestamp: Date.now() }
      return data
    })
  },

  getOrganizationApplicants(bypassCache = false): Promise<OrganizationApplicantRecord[]> {
    if (!bypassCache && cachedOrgApplicants && Date.now() - cachedOrgApplicants.timestamp < ORG_CACHE_TTL) {
      return Promise.resolve(cachedOrgApplicants.data)
    }
    return apiRequest<OrganizationApplicantRecord[]>('/opportunities/organization/applicants').then((data) => {
      cachedOrgApplicants = { data, timestamp: Date.now() }
      return data
    })
  },

  getOrganizationApplicant(applicantId: string, bypassCache = false): Promise<OrganizationApplicantRecord> {
    const cached = applicantDetailCache.get(applicantId)
    if (!bypassCache && cached && Date.now() - cached.timestamp < ORG_CACHE_TTL) {
      return Promise.resolve(cached.data)
    }
    return apiRequest<OrganizationApplicantRecord>(
      `/opportunities/organization/applicants/${encodeURIComponent(applicantId)}`,
    ).then((data) => {
      applicantDetailCache.set(applicantId, { data, timestamp: Date.now() })
      return data
    })
  },

  updateStatus(opportunityId: string, applicationId: string, status: ApplicationStatus): Promise<unknown> {
    return apiRequest(
      `/opportunities/${encodeURIComponent(opportunityId)}/applications/${encodeURIComponent(applicationId)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
    ).then((res) => {
      cachedSummary = null
      cachedOrgApplicants = null
      applicantDetailCache.delete(applicationId)
      return res
    })
  },

  getApplicantCvDownloadUrl(
    opportunityId: string,
    applicationId: string,
    cvId: string,
  ): Promise<{ downloadUrl: string; fileName: string }> {
    return apiRequest<{ downloadUrl: string; fileName: string }>(
      `/opportunities/${encodeURIComponent(opportunityId)}/applications/${encodeURIComponent(applicationId)}/cvs/${encodeURIComponent(cvId)}/download`,
    )
  },

  invalidateOrganizationCache() {
    cachedSummary = null
    cachedOrgApplicants = null
    applicantDetailCache.clear()
  },
}
