export type UserRole = 'STUDENT' | 'ORGANIZATION' | 'ADMIN'

export interface MockUser {
  id: string
  email: string
  firstName: string
  middleName?: string
  lastName: string
  role: UserRole
  organizationId?: string
  organizationName?: string
}

export interface MockAccount extends MockUser {
  demoPassword: string
}

export interface RegisterInput {
  email: string
  password: string
  firstName: string
  middleName?: string
  lastName: string
  role: Exclude<UserRole, 'ADMIN'>
}

export interface AuthContextValue {
  user: MockUser | null
  isAuthenticated: boolean
  isLoading: boolean
  register: (input: RegisterInput) => Promise<MockUser>
  login: (email: string, password: string) => Promise<MockUser>
  logout: () => void
}
