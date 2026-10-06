import type { OpportunityFilters, PublicOpportunity } from '../types/opportunity'
import { apiRequest } from './api'

export interface OpportunityRecommendation {
  opportunity: PublicOpportunity
  score: number
  matchedSkills: string[]
  matchedInterests: string[]
}

export const recommendationService = {
  getRecommendations(filters: OpportunityFilters = {}): Promise<OpportunityRecommendation[]> {
    const params = new URLSearchParams()
    if (filters.search?.trim()) params.set('keyword', filters.search.trim())
    if (filters.field?.trim()) params.set('field', filters.field.trim())
    if (filters.location?.trim()) params.set('location', filters.location.trim())
    if (filters.skills?.trim()) params.set('skillNames', filters.skills.trim())
    if (filters.type) params.set('type', filters.type)
    if (filters.remote) params.set('isRemote', String(filters.remote === 'remote'))
    if (filters.academicYear != null) params.set('academicYear', String(filters.academicYear))
    const query = params.size ? `?${params.toString()}` : ''
    return apiRequest<OpportunityRecommendation[]>(`/students/recommendations${query}`)
  },
}
