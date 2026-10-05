import { apiRequest } from './api'

export type RegistrationRole = 'STUDENT' | 'ORGANIZATION'

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  middleName?: string
  lastName: string
  role: RegistrationRole
}

export interface RegisteredUser {
  id: string
  email?: string
  firstName: string
  middleName?: string | null
  lastName: string
  role: RegistrationRole
}

export interface RegisterResponse {
  user: RegisteredUser
  session: {
    access_token: string
    refresh_token: string
  } | null
}

export function registerAccount(data: RegisterRequest) {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
