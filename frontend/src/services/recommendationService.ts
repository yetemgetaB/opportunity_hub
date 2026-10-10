import type { OpportunityFilters, PublicOpportunity } from '../types/opportunity'
import { apiRequest } from './api'

export interface OpportunityRecommendation {
  opportunity: PublicOpportunity
  score: number
  matchedSkills: string[]
  matchedInterests: string[]
}

const recommendationsCache = new Map<string, { data: OpportunityRecommendation[]; timestamp: number }>()
const REC_CACHE_TTL = 90 * 1000 // 90 seconds fresh window

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

    const cached = recommendationsCache.get(query)
    if (cached && Date.now() - cached.timestamp < REC_CACHE_TTL) {
      return Promise.resolve(cached.data)
    }

    return apiRequest<OpportunityRecommendation[]>(`/students/recommendations${query}`).then((data) => {
      recommendationsCache.set(query, { data, timestamp: Date.now() })
      return data
    })
  },

  clearCache() {
    recommendationsCache.clear()
  },
}
