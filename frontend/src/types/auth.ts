export type UserRole = 'STUDENT' | 'ORGANIZATION' | 'ADMIN'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  middleName?: string | null
  lastName: string
  role: UserRole
  isActive?: boolean
  organizationName?: string
}

export interface BackendUser extends Omit<AuthUser, 'email' | 'organizationName'> {
  email?: string
  organization?: { name?: string } | null
}

export interface AuthSession {
  access_token: string
  refresh_token?: string
  expires_at?: number
  expires_in?: number
  token_type?: string
}

export interface AuthResponse {
  user: BackendUser
  session: AuthSession | null
}

export interface RegisterInput {
  email: string
  password: string
  firstName: string
  middleName?: string
  lastName: string
  role: Exclude<UserRole, 'ADMIN'>
  organizationName?: string
}

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  register: (input: RegisterInput) => Promise<AuthResponse>
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
}
