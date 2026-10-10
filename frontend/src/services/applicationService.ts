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

export const applicationService = {
  apply(opportunityId: string): Promise<ApplicationItem> {
    return apiRequest<ApplicationItem>(`/opportunities/${encodeURIComponent(opportunityId)}/apply`, {
      method: 'POST',
    })
  },

  getMyApplications(): Promise<ApplicationItem[]> {
    return apiRequest<ApplicationItem[]>('/opportunities/applications')
  },

  withdrawApplication(applicationId: string): Promise<ApplicationItem> {
    return apiRequest<ApplicationItem>(`/opportunities/applications/${encodeURIComponent(applicationId)}/withdraw`, {
      method: 'PATCH',
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

  updateStatus(opportunityId: string, applicationId: string, status: ApplicationStatus): Promise<unknown> {
    return apiRequest(
      `/opportunities/${encodeURIComponent(opportunityId)}/applications/${encodeURIComponent(applicationId)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
    )
  },
}
