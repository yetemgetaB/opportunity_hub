import { apiRequest } from './api'
import type {
  OpportunityFilters,
  OpportunityListResult,
  OpportunityUpdatePayload,
  OrganizationOpportunity,
  PublicOpportunity,
} from '../types/opportunity'

type OpportunityListPayload =
  | PublicOpportunity[]
  | {
      items?: PublicOpportunity[]
      opportunities?: PublicOpportunity[]
      total?: number
    }

function buildQuery(filters: OpportunityFilters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function listOpportunities(
  filters: OpportunityFilters,
  signal?: AbortSignal,
): Promise<OpportunityListResult> {
  const payload = await apiRequest<OpportunityListPayload>(
    `/opportunities${buildQuery(filters)}`,
    { signal },
  )

  if (Array.isArray(payload)) return { items: payload }

  const items = payload.items ?? payload.opportunities
  if (!items) throw new Error('The opportunities response did not contain a list.')
  return { items, total: payload.total }
}

export function getOpportunity(id: string, signal?: AbortSignal) {
  return apiRequest<PublicOpportunity>(`/opportunities/${encodeURIComponent(id)}`, { signal })
}

export function getOrganizationOpportunity(id: string, signal?: AbortSignal) {
  return apiRequest<OrganizationOpportunity>(`/opportunities/my/${encodeURIComponent(id)}`, { signal })
}

export function updateOrganizationOpportunity(id: string, payload: OpportunityUpdatePayload) {
  return apiRequest<OrganizationOpportunity>(`/opportunities/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function publishOrganizationOpportunity(id: string) {
  return apiRequest<OrganizationOpportunity>(`/opportunities/${encodeURIComponent(id)}/publish`, {
    method: 'PATCH',
  })
}

export function deleteOrganizationOpportunity(id: string) {
  return apiRequest<void>(`/opportunities/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
