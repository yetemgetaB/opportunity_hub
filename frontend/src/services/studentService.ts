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

export interface CvItem {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  isDefault: boolean
  uploadedAt: string
}

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

  getCvs(): Promise<CvItem[]> {
    return apiRequest<CvItem[]>('/students/profile/cvs')
  },

  uploadCv(file: File, isDefault = false): Promise<CvItem> {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest<CvItem>(`/students/profile/cv?isDefault=${isDefault}`, {
      method: 'POST',
      body: formData,
    })
  },

  setDefaultCv(cvId: string): Promise<CvItem> {
    return apiRequest<CvItem>(`/students/profile/cvs/${encodeURIComponent(cvId)}/default`, {
      method: 'PATCH',
    })
  },

  deleteCv(cvId: string): Promise<void> {
    return apiRequest<void>(`/students/profile/cvs/${encodeURIComponent(cvId)}`, {
      method: 'DELETE',
    })
  },

  getDownloadUrl(cvId: string): Promise<{ downloadUrl: string; expiresIn: number }> {
    return apiRequest<{ downloadUrl: string; expiresIn: number }>(`/students/profile/cvs/${encodeURIComponent(cvId)}/download`)
  },
}

