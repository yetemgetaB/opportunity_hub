import type {
  OpportunityFilters,
  OpportunitySearchResult,
  OpportunityUpdatePayload,
  OrganizationOpportunity,
  PublicOpportunity,
} from '../types/opportunity'
import { apiRequest } from './api'

function queryString(filters: OpportunityFilters) {
  const params = new URLSearchParams()
  if (filters.search?.trim()) params.set('keyword', filters.search.trim())
  if (filters.field?.trim()) params.set('field', filters.field.trim())
  if (filters.location?.trim()) params.set('location', filters.location.trim())
  if (filters.skills?.trim()) params.set('skillNames', filters.skills.trim())
  if (filters.type) params.set('type', filters.type)
  if (filters.remote) params.set('isRemote', String(filters.remote === 'remote'))
  if (filters.academicYear != null) params.set('academicYear', String(filters.academicYear))
  return params.size ? `?${params.toString()}` : ''
}

export interface OpportunityCreatePayload extends OpportunityUpdatePayload {
  skills?: { skillId: string; requirementLevel: 'REQUIRED' | 'PREFERRED' }[]
}

export const opportunityService = {
  async listOpportunities(filters: OpportunityFilters, signal?: AbortSignal): Promise<OpportunitySearchResult[]> {
    return apiRequest<OpportunitySearchResult[]>(`/opportunities${queryString(filters)}`, { signal })
  },

  async getOpportunity(id: string, signal?: AbortSignal): Promise<PublicOpportunity> {
    return apiRequest<PublicOpportunity>(`/opportunities/${encodeURIComponent(id)}`, { signal })
  },

  async getMyOpportunities(signal?: AbortSignal): Promise<OrganizationOpportunity[]> {
    return apiRequest<OrganizationOpportunity[]>('/opportunities/my', { signal })
  },

  async getMyOpportunity(id: string, signal?: AbortSignal): Promise<OrganizationOpportunity> {
    return apiRequest<OrganizationOpportunity>(`/opportunities/my/${encodeURIComponent(id)}`, { signal })
  },

  async createOpportunity(payload: OpportunityCreatePayload): Promise<OrganizationOpportunity> {
    return apiRequest<OrganizationOpportunity>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateOpportunity(id: string, payload: Partial<OpportunityCreatePayload>): Promise<OrganizationOpportunity> {
    return apiRequest<OrganizationOpportunity>(`/opportunities/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  async publishOpportunity(id: string): Promise<OrganizationOpportunity> {
    return apiRequest<OrganizationOpportunity>(`/opportunities/${encodeURIComponent(id)}/publish`, {
      method: 'PATCH',
    })
  },

  async deleteOpportunity(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/opportunities/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}

export const listOpportunities = opportunityService.listOpportunities.bind(opportunityService)
export const getOpportunity = opportunityService.getOpportunity.bind(opportunityService)
export const getOrganizationOpportunity = opportunityService.getMyOpportunity.bind(opportunityService)
export const updateOrganizationOpportunity = opportunityService.updateOpportunity.bind(opportunityService)
export const publishOrganizationOpportunity = opportunityService.publishOpportunity.bind(opportunityService)
export const deleteOrganizationOpportunity = opportunityService.deleteOpportunity.bind(opportunityService)
