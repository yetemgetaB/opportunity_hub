import { apiRequest } from './api'

export interface StudentProfile {
  userId: string
  academicYear: number
  university: string
  fieldOfStudy: string
  location: string | null
  careerGoals: string | null
  careerGoalTags: string[]
  interests: string[]
  isDiscoverable: boolean
}

export type StudentProfilePayload = Partial<Omit<StudentProfile, 'userId'>>

export const studentService = {
  getProfile(): Promise<StudentProfile> {
    return apiRequest<StudentProfile>('/students/profile')
  },

  createProfile(payload: Omit<StudentProfilePayload, 'userId'>): Promise<StudentProfile> {
    return apiRequest<StudentProfile>('/students/profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateProfile(payload: StudentProfilePayload): Promise<StudentProfile> {
    return apiRequest<StudentProfile>('/students/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}
