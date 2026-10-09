import type { AuthResponse, AuthSession, AuthUser, BackendUser, RegisterInput } from '../types/auth'
import { apiRequest, setApiAccessToken } from './api'

const AUTH_STORAGE_KEY = 'opportunity_hub_auth_session'

interface StoredSession {
  accessToken: string
  userId: string
  email: string
  expiresAt?: number
}

function normalizeUser(user: BackendUser, email: string): AuthUser {
  if (!user.id || !['STUDENT', 'ORGANIZATION', 'ADMIN'].includes(user.role)) {
    throw new Error('The server returned an invalid user identity.')
  }
  return {
    id: user.id,
    email: user.email ?? email,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    organizationName: user.organization?.name,
  }
}

function saveSession(session: AuthSession, user: BackendUser, email: string) {
  const stored: StoredSession = {
    accessToken: session.access_token,
    userId: user.id,
    email,
    expiresAt: session.expires_at,
  }
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(stored))
  setApiAccessToken(session.access_token)
}

export function readStoredSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (
      !value ||
      typeof value !== 'object' ||
      !('accessToken' in value) ||
      typeof value.accessToken !== 'string' ||
      !('userId' in value) ||
      typeof value.userId !== 'string' ||
      !('email' in value) ||
      typeof value.email !== 'string'
    ) {
      clearSession()
      return null
    }
    const stored = value as StoredSession
    if (stored.expiresAt && stored.expiresAt * 1000 <= Date.now()) {
      clearSession()
      return null
    }
    setApiAccessToken(stored.accessToken)
    return stored
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  setApiAccessToken(null)
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = readStoredSession()
  if (!session) return null
  const user = await apiRequest<BackendUser>(`/users/${encodeURIComponent(session.userId)}`)
  return normalizeUser(user, session.email)
}

export async function registerAccount(input: RegisterInput): Promise<AuthResponse> {
  const { organizationName, ...base } = input
  const body = {
    ...base,
    ...(input.role === 'ORGANIZATION' ? { organizationName: organizationName?.trim() } : {}),
  }
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function loginAccount(email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (!response.session?.access_token) {
    throw new Error('The server did not return an authenticated session.')
  }
  saveSession(response.session, response.user, email)
  return normalizeUser(response.user, email)
}

export async function updatePassword(newPassword: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ newPassword }),
  })
}

export function logoutAccount() {
  clearSession()
}
