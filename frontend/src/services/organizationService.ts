import { apiRequest } from './api'

export interface OrganizationProfile {
  id: string
  name: string
  description: string | null
  websiteUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
}

export type OrganizationProfilePayload = Partial<Pick<
  OrganizationProfile,
  'name' | 'description' | 'websiteUrl' | 'contactEmail' | 'contactPhone'
>>

export const organizationService = {
  getProfile(): Promise<OrganizationProfile> {
    return apiRequest<OrganizationProfile>('/organizations/profile')
  },

  updateProfile(payload: OrganizationProfilePayload): Promise<OrganizationProfile> {
    return apiRequest<OrganizationProfile>('/organizations/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
