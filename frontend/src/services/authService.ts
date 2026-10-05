import type { MockAccount, MockUser, RegisterInput } from '../types/auth'
import { readMockStorage, removeMockStorage, writeMockStorage } from '../mock/storage'

export const MOCK_SESSION_STORAGE_KEY = 'opportunity_hub_session'
const MOCK_ACCOUNTS_STORAGE_KEY = 'opportunity_hub_demo_accounts'

const seededAccounts: MockAccount[] = [
  {
    id: 'demo-student-1',
    email: 'demo.student@opportunityhub.test',
    firstName: 'Demo',
    lastName: 'Student',
    role: 'STUDENT',
    demoPassword: 'StudentDemo2026!',
  },
  {
    id: 'demo-organization-1',
    email: 'demo.organization@opportunityhub.test',
    firstName: 'Demo',
    lastName: 'Recruiter',
    role: 'ORGANIZATION',
    organizationId: 'demo-org-1',
    organizationName: 'Addis Tech Labs',
    demoPassword: 'OrganizationDemo2026!',
  },
]

function getAccounts() {
  const stored = readMockStorage<MockAccount[] | null>(MOCK_ACCOUNTS_STORAGE_KEY, null)
  if (!stored) {
    writeMockStorage(MOCK_ACCOUNTS_STORAGE_KEY, seededAccounts)
    return seededAccounts
  }
  return stored
}

function publicUser(account: MockAccount): MockUser {
  const { demoPassword: _demoPassword, ...user } = account
  return user
}

export function getCurrentMockUser(): MockUser | null {
  const user = readMockStorage<MockUser | null>(MOCK_SESSION_STORAGE_KEY, null)
  if (!user || typeof user.id !== 'string' || typeof user.email !== 'string') return null
  if (!['STUDENT', 'ORGANIZATION', 'ADMIN'].includes(user.role)) return null
  return user
}

export async function registerAccount(input: RegisterInput): Promise<MockUser> {
  const accounts = getAccounts()
  const email = input.email.trim().toLowerCase()
  if (accounts.some((account) => account.email.toLowerCase() === email)) {
    throw new Error('An account with this email already exists.')
  }
  const id = `demo-${input.role.toLowerCase()}-${crypto.randomUUID()}`
  const account: MockAccount = {
    id,
    email,
    firstName: input.firstName.trim(),
    ...(input.middleName?.trim() ? { middleName: input.middleName.trim() } : {}),
    lastName: input.lastName.trim(),
    role: input.role,
    ...(input.role === 'ORGANIZATION'
      ? { organizationId: id, organizationName: `${input.firstName.trim()} ${input.lastName.trim()}'s Organization` }
      : {}),
    demoPassword: input.password,
  }
  writeMockStorage(MOCK_ACCOUNTS_STORAGE_KEY, [...accounts, account])
  return publicUser(account)
}

export async function loginAccount(email: string, password: string): Promise<MockUser> {
  const account = getAccounts().find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.demoPassword === password,
  )
  if (!account) throw new Error('The email or password is incorrect.')
  const user = publicUser(account)
  writeMockStorage(MOCK_SESSION_STORAGE_KEY, user)
  return user
}

export function logoutAccount() {
  removeMockStorage(MOCK_SESSION_STORAGE_KEY)
}

export function getDemoLoginHelp() {
  return [
    { email: 'demo.student@opportunityhub.test', password: 'StudentDemo2026!', role: 'STUDENT' as const },
    { email: 'demo.organization@opportunityhub.test', password: 'OrganizationDemo2026!', role: 'ORGANIZATION' as const },
  ]
}
