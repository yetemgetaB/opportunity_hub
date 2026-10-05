import type { ApplicationItem } from '../types/application'
import type { ApplicantListItem } from '../types/organization'
import type { Opportunity as StudentOpportunity } from '../types/student'
import type {
  OpportunityFilters,
  OpportunityListResult,
  OpportunityUpdatePayload,
  OrganizationOpportunity,
  PublicOpportunity,
} from '../types/opportunity'
import type { MockUser } from '../types/auth'
import { getCurrentMockUser } from './authService'
import { readMockStorage, writeMockStorage } from '../mock/storage'
import { DEMO_OPPORTUNITIES } from '../mock/opportunities'
import { STUDENT_NOTIFICATIONS } from '../utils/studentData'
import type { StudentNotificationItem } from '../types/studentNotification'
import type { StudentAssessment } from '../types/assessment'
import type { ProfileFormState } from '../types/student'
import type { NotificationItem, OrganizationProfileFormState, PostOpportunityFormState } from '../types/organization'
import { DEFAULT_PROFILE } from '../utils/studentData'
import { DEFAULT_ORG_PROFILE, NOTIFICATIONS } from '../utils/organizationData'

const OPPORTUNITY_KEY = 'opportunity_hub_opportunities'
const APPLICATION_KEY = 'opportunity_hub_applications'
const NOTIFICATION_KEY = 'opportunity_hub_notifications'
const ORGANIZATION_NOTIFICATION_KEY = 'opportunity_hub_organization_notifications'

export interface SavedOpportunityEntry {
  id: string
  savedAt: number
}

export interface DemoApplicant extends ApplicantListItem {
  opportunityId: string
  organizationId: string
  applicationId?: string
  email: string
  university: string
  degree: string
}

export interface DemoOpportunityStats {
  total: number
  published: number
  drafts: number
  closed: number
  applicants: number
  recentApplications: number
}

export interface OpportunityServiceFilters {
  search?: string
  type?: string
  location?: string
  remote?: 'remote' | 'onsite'
  field?: string
  academicYear?: number
  skills?: string
  sort?: 'newest' | 'deadline' | 'match'
}

function readOpportunities() {
  return readMockStorage<StudentOpportunity[]>(OPPORTUNITY_KEY, DEMO_OPPORTUNITIES)
}

function writeOpportunities(opportunities: StudentOpportunity[]) {
  writeMockStorage(OPPORTUNITY_KEY, opportunities)
}

function sessionUser(userId?: string): MockUser | null {
  const user = getCurrentMockUser()
  return user && (!userId || user.id === userId) ? user : null
}

function typeFromName(type: string): OrganizationOpportunity['opportunityType'] {
  const value = type.toUpperCase().replace(/[\s-]+/g, '_')
  if (value === 'FULL_TIME' || value === 'PART_TIME' || value === 'FULLTIME' || value === 'PARTTIME') return 'JOB'
  const valid = ['INTERNSHIP', 'JOB', 'SCHOLARSHIP', 'HACKATHON', 'COMPETITION', 'TRAINING', 'VOLUNTEER', 'FELLOWSHIP', 'OTHER'] as const
  return valid.includes(value as typeof valid[number]) ? value as typeof valid[number] : 'OTHER'
}

function typeToName(type?: string) {
  if (!type) return 'Opportunity'
  return type.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function deadlineTimestamp(value?: string | null) {
  if (!value) return Number.POSITIVE_INFINITY
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : date.getTime()
}

function dateLabel(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

function toPublicOpportunity(item: StudentOpportunity): PublicOpportunity {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    opportunityType: typeFromName(item.type),
    status: item.status ?? 'PUBLISHED',
    organization: { id: item.organizationId, name: item.company, description: item.tagline },
    location: item.location,
    isRemote: Boolean(item.isRemote ?? /remote/i.test(item.location)),
    applicationDeadline: item.deadline,
    minimumAcademicYear: item.minimumAcademicYear ?? null,
    maximumAcademicYear: item.maximumAcademicYear ?? null,
    minimumGpa: item.minimumGpa ?? null,
    eligibleFields: item.eligibleFields ?? item.fieldsOfStudy ?? [],
    compensation: item.compensation ?? null,
    applicationUrl: item.applicationUrl ?? null,
    skills: item.tags.map((name) => ({ name })),
    createdAt: item.createdAt,
    publishedAt: item.publishedAt,
  }
}

function initialApplications(): ApplicationItem[] {
  const opportunity = (id: string) => DEMO_OPPORTUNITIES.find((item) => item.id === id)
  return [
    ['demo-opp-1', 'UNDER_REVIEW', '2026-09-27T10:00:00.000Z'],
    ['demo-opp-3', 'SHORTLISTED', '2026-09-20T10:00:00.000Z'],
    ['demo-opp-8', 'ACCEPTED', '2026-08-12T10:00:00.000Z'],
  ].flatMap(([opportunityId, status, appliedAt], index) => {
    const item = opportunity(opportunityId)
    if (!item) return []
    return [{
      id: `demo-application-${index + 1}`,
      opportunityId,
      studentId: 'demo-student-1',
      organizationId: item.organizationId,
      title: item.title,
      company: item.company,
      location: item.location,
      appliedDate: dateLabel(appliedAt),
      appliedAt,
      matchScore: item.fit,
      status: status as ApplicationItem['status'],
    }]
  })
}

function readApplications() {
  return readMockStorage<ApplicationItem[]>(APPLICATION_KEY, initialApplications())
}

function writeApplications(applications: ApplicationItem[]) {
  writeMockStorage(APPLICATION_KEY, applications)
}

function savedStorageKey(userId: string) {
  return `opportunity_hub_saved_${userId}`
}

function getOwnerOrganizationId(user: MockUser) {
  return user.organizationId ?? user.id
}

function requireOrganization(userId?: string) {
  const user = sessionUser(userId)
  if (!user || user.role !== 'ORGANIZATION') throw new Error('Sign in as an organization to manage opportunities.')
  return user
}

function requireStudent(userId?: string) {
  const user = sessionUser(userId)
  if (!user || user.role !== 'STUDENT') throw new Error('Sign in as a student to use this action.')
  return user
}

function ensureOwner(opportunity: StudentOpportunity, user: MockUser) {
  if (opportunity.organizationId !== getOwnerOrganizationId(user)) {
    throw new Error('You do not have permission to manage this opportunity.')
  }
}

function toOrganizationOpportunity(item: StudentOpportunity): OrganizationOpportunity {
  const publicItem = toPublicOpportunity(item)
  return {
    ...publicItem,
    opportunityType: typeFromName(item.type),
    status: item.status ?? 'PUBLISHED',
    isRemote: Boolean(item.isRemote),
    eligibleFields: item.eligibleFields ?? item.fieldsOfStudy ?? [],
  }
}

function applicationIsExpired(opportunity: StudentOpportunity) {
  const deadline = deadlineTimestamp(opportunity.deadline)
  if (!Number.isFinite(deadline)) return false
  const date = new Date(deadline)
  date.setHours(23, 59, 59, 999)
  return date.getTime() < Date.now()
}

const demoApplicants: DemoApplicant[] = [
  {
    id: '1',
    name: 'Alex Mercer',
    initials: 'AM',
    matchScore: 96,
    matchTier: 'Excellent Fit',
    skillsMatch: 98,
    status: 'Under Review',
    dateApplied: 'Sep 28, 2026',
    opportunityId: 'demo-opp-1',
    organizationId: 'demo-org-1',
    email: 'alex.mercer@student.example',
    university: 'Addis Ababa University',
    degree: 'Computer Science',
  },
  {
    id: '2',
    name: 'Sarah Ko',
    initials: 'SK',
    matchScore: 91,
    matchTier: 'High Fit',
    skillsMatch: 92,
    status: 'Interview',
    dateApplied: 'Sep 24, 2026',
    opportunityId: 'demo-opp-2',
    organizationId: 'demo-org-1',
    email: 'sarah.ko@student.example',
    university: 'Addis Ababa University',
    degree: 'Computer Science',
  },
  {
    id: '3',
    name: 'Tony Ross',
    initials: 'TR',
    matchScore: 84,
    matchTier: 'Good Fit',
    skillsMatch: 85,
    status: 'Shortlisted',
    dateApplied: 'Sep 20, 2026',
    opportunityId: 'demo-opp-4',
    organizationId: 'demo-org-1',
    email: 'tony.ross@student.example',
    university: 'Addis Ababa University',
    degree: 'Computer Science',
  },
  {
    id: 'demo-applicant-4',
    name: 'Abel Alemu',
    initials: 'AA',
    matchScore: 88,
    matchTier: 'High Fit',
    skillsMatch: 90,
    status: 'Under Review',
    dateApplied: 'Sep 30, 2026',
    opportunityId: 'demo-opp-3',
    organizationId: 'demo-org-2',
    email: 'abel.alemu@student.example',
    university: 'Hawassa University',
    degree: 'Data Science',
  },
]

function profileStorageKey(userId: string) {
  return `opportunity_hub_profile_${userId}`
}

function organizationProfileStorageKey(orgId: string) {
  return `opportunity_hub_organization_profile_${orgId}`
}

function applicantStatusStorageKey(orgId: string) {
  return `opportunity_hub_applicant_status_${orgId}`
}

export const opportunityService = {
  findOpportunity(id: string) {
    return readOpportunities().find((item) => item.id === id)
  },

  async getOpportunities(filters: OpportunityServiceFilters = {}) {
    await Promise.resolve()
    const needle = filters.search?.trim().toLowerCase()
    const visible = readOpportunities().filter((item) => item.status === 'PUBLISHED')
    const results = visible.filter((item) => {
      const matchesSearch = !needle || [
        item.title,
        item.company,
        item.description,
        ...item.tags,
      ].some((value) => value.toLowerCase().includes(needle))
      const matchesType = !filters.type || filters.type === 'All Types' || typeFromName(item.type) === typeFromName(filters.type)
      const matchesLocation = !filters.location || item.location.toLowerCase().includes(filters.location.toLowerCase())
      const matchesRemote = !filters.remote || Boolean(item.isRemote ?? /remote/i.test(item.location)) === (filters.remote === 'remote')
      const fields = item.eligibleFields ?? item.fieldsOfStudy ?? []
      const matchesField = !filters.field || fields.some((field) => field.toLowerCase().includes(filters.field!.toLowerCase()))
      const matchesYear = filters.academicYear == null ||
        ((item.minimumAcademicYear == null || item.minimumAcademicYear <= filters.academicYear) &&
          (item.maximumAcademicYear == null || item.maximumAcademicYear >= filters.academicYear))
      const matchesSkills = !filters.skills || item.tags.some((skill) => skill.toLowerCase().includes(filters.skills!.toLowerCase()))
      return matchesSearch && matchesType && matchesLocation && matchesRemote && matchesField && matchesYear && matchesSkills
    })
    if (filters.sort === 'deadline') results.sort((a, b) => deadlineTimestamp(a.deadline) - deadlineTimestamp(b.deadline))
    else if (filters.sort === 'match') results.sort((a, b) => b.fit - a.fit)
    else results.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    return results
  },

  async getOpportunityById(id: string) {
    await Promise.resolve()
    const item = readOpportunities().find((opportunity) => opportunity.id === id && opportunity.status === 'PUBLISHED')
    if (!item) throw new Error('Opportunity not found.')
    return item
  },

  async getMyOpportunities(userId?: string) {
    await Promise.resolve()
    const user = requireOrganization(userId)
    const organizationId = getOwnerOrganizationId(user)
    return readOpportunities().filter((item) => item.organizationId === organizationId)
  },

  async createOpportunity(form: PostOpportunityFormState, userId?: string) {
    const user = requireOrganization(userId)
    const organizationId = getOwnerOrganizationId(user)
    const current = readOpportunities()
    const item: StudentOpportunity = {
      id: `demo-opp-${crypto.randomUUID()}`,
      company: user.organizationName ?? `${user.firstName} ${user.lastName}'s Organization`,
      location: form.location.trim() || 'Location not specified',
      tagline: 'A demo opportunity from your organization.',
      title: form.title.trim(),
      description: [form.description.trim(), form.responsibilities.trim()].filter(Boolean).join('\n\nResponsibilities:\n'),
      tags: [...form.requiredSkills, ...form.preferredSkills],
      type: form.type,
      fieldsOfStudy: form.field ? [form.field.trim()] : [],
      fit: 80,
      deadline: form.applicationDeadline ? dateLabel(`${form.applicationDeadline}T12:00:00`) : '',
      overview: form.description.trim(),
      requirements: form.requiredSkills,
      benefits: [],
      matchBreakdown: [],
      organizationId,
      status: 'PUBLISHED',
      isRemote: /remote/i.test(form.location),
      eligibleFields: form.field ? [form.field.trim()] : [],
      compensation: null,
      applicationUrl: null,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    }
    writeOpportunities([item, ...current])
    return item
  },

  async updateOpportunity(id: string, payload: OpportunityUpdatePayload | Partial<StudentOpportunity>, userId?: string) {
    const user = requireOrganization(userId)
    const current = readOpportunities()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Opportunity not found.')
    ensureOwner(found, user)
    const update = payload as Partial<StudentOpportunity> & {
      opportunityType?: string
      applicationDeadline?: string | null
      eligibleFields?: string[]
    }
    const updated: StudentOpportunity = {
      ...found,
      ...update,
      type: update.type ?? typeToName(update.opportunityType),
      deadline: update.deadline ?? (update.applicationDeadline ? dateLabel(update.applicationDeadline) : found.deadline),
      fieldsOfStudy: update.fieldsOfStudy ?? update.eligibleFields ?? found.fieldsOfStudy,
      eligibleFields: update.eligibleFields ?? update.fieldsOfStudy ?? found.eligibleFields,
      location: update.location ?? found.location,
      description: update.description ?? found.description,
      overview: update.overview ?? update.description ?? found.overview,
      isRemote: update.isRemote ?? found.isRemote,
      tags: update.tags ?? update.skills?.map((skill) => skill.skill?.name ?? skill.name ?? '').filter(Boolean) ?? found.tags,
    }
    writeOpportunities(current.map((item) => item.id === id ? updated : item))
    return updated
  },

  async deleteOpportunity(id: string, userId?: string) {
    const user = requireOrganization(userId)
    const current = readOpportunities()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Opportunity not found.')
    ensureOwner(found, user)
    writeOpportunities(current.filter((item) => item.id !== id))
    writeApplications(readApplications().filter((application) => application.opportunityId !== id))
    return true
  },

  async publishOpportunity(id: string, userId?: string) {
    const user = requireOrganization(userId)
    const current = readOpportunities()
    const found = current.find((item) => item.id === id)
    if (!found) throw new Error('Opportunity not found.')
    ensureOwner(found, user)
    const updated = { ...found, status: 'PUBLISHED' as const, publishedAt: new Date().toISOString() }
    writeOpportunities(current.map((item) => item.id === id ? updated : item))
    return updated
  },

  saveOpportunity(id: string, userId?: string) {
    const user = requireStudent(userId)
    const item = readOpportunities().find((opportunity) => opportunity.id === id && opportunity.status === 'PUBLISHED')
    if (!item) throw new Error('Opportunity not found.')
    const key = savedStorageKey(user.id)
    const current = readMockStorage<SavedOpportunityEntry[]>(key, [])
    if (!current.some((entry) => entry.id === id)) {
      writeMockStorage(key, [{ id, savedAt: Date.now() }, ...current])
    }
    return true
  },

  unsaveOpportunity(id: string, userId?: string) {
    const user = requireStudent(userId)
    const key = savedStorageKey(user.id)
    writeMockStorage(key, readMockStorage<SavedOpportunityEntry[]>(key, []).filter((entry) => entry.id !== id))
    return true
  },

  getSavedOpportunities(userId?: string) {
    const user = requireStudent(userId)
    const entries = readMockStorage<SavedOpportunityEntry[]>(savedStorageKey(user.id), [])
    const all = readOpportunities()
    return entries
      .sort((a, b) => b.savedAt - a.savedAt)
      .flatMap((entry) => {
        const opportunity = all.find((item) => item.id === entry.id)
        return opportunity ? [{ entry, opportunity }] : []
      })
  },

  isSaved(id: string, userId?: string) {
    const user = sessionUser(userId)
    if (!user || user.role !== 'STUDENT') return false
    return readMockStorage<SavedOpportunityEntry[]>(savedStorageKey(user.id), []).some((entry) => entry.id === id)
  },

  async applyToOpportunity(id: string, userId?: string) {
    const user = requireStudent(userId)
    const opportunity = readOpportunities().find((item) => item.id === id && item.status === 'PUBLISHED')
    if (!opportunity) throw new Error('Opportunity not found.')
    if (applicationIsExpired(opportunity)) throw new Error('The application deadline has passed.')
    const applications = readApplications()
    if (applications.some((item) => item.studentId === user.id && item.opportunityId === id)) {
      throw new Error('You have already applied to this opportunity.')
    }
    const application: ApplicationItem = {
      id: `demo-application-${crypto.randomUUID()}`,
      opportunityId: id,
      studentId: user.id,
      organizationId: opportunity.organizationId,
      title: opportunity.title,
      company: opportunity.company,
      location: opportunity.location,
      appliedDate: dateLabel(new Date().toISOString()),
      appliedAt: new Date().toISOString(),
      matchScore: opportunity.fit,
      status: 'SUBMITTED',
    }
    writeApplications([application, ...applications])
    return application
  },

  getApplications(userId?: string) {
    const user = sessionUser(userId)
    if (!user || user.role !== 'STUDENT') return []
    return readApplications().filter((application) => application.studentId === user.id)
  },

  getApplicants(userId?: string, opportunityId?: string) {
    const user = requireOrganization(userId)
    const organizationId = getOwnerOrganizationId(user)
    const opportunities = readOpportunities().filter((item) => item.organizationId === organizationId)
    const allowedIds = new Set(opportunities.map((item) => item.id))
    const applied = readApplications().filter((application) =>
      allowedIds.has(application.opportunityId ?? '') &&
      (!opportunityId || application.opportunityId === opportunityId),
    )
    const applicantsFromApplications: DemoApplicant[] = applied.map((application) => ({
      id: application.id,
      name: 'Demo Student',
      initials: 'DS',
      matchScore: application.matchScore,
      matchTier: application.matchScore >= 90 ? 'Excellent Fit' : application.matchScore >= 80 ? 'High Fit' : 'Good Fit',
      skillsMatch: application.matchScore,
      status: application.status === 'ACCEPTED'
        ? 'Accepted'
        : application.status === 'SHORTLISTED'
          ? 'Shortlisted'
          : application.status === 'Interview'
            ? 'Interview'
            : 'Under Review',
      dateApplied: application.appliedDate,
      opportunityId: application.opportunityId ?? '',
      organizationId,
      applicationId: application.id,
      email: 'demo.student@opportunityhub.test',
      university: 'Addis Ababa University',
      degree: 'Computer Science',
    }))
    const all = [...demoApplicants, ...applicantsFromApplications]
    const statuses = readMockStorage<Record<string, ApplicantListItem['status']>>(applicantStatusStorageKey(organizationId), {})
    const seen = new Set<string>()
    return all.filter((applicant) => {
      if (applicant.organizationId !== organizationId || (opportunityId && applicant.opportunityId !== opportunityId)) return false
      if (seen.has(applicant.id)) return false
      seen.add(applicant.id)
      return true
    }).map((applicant) => ({ ...applicant, status: statuses[applicant.id] ?? applicant.status }))
  },

  updateApplicantStatus(applicantId: string, status: ApplicantListItem['status'], userId?: string) {
    const user = requireOrganization(userId)
    const organizationId = getOwnerOrganizationId(user)
    const applicant = this.getApplicants(user.id).find((item) => item.id === applicantId)
    if (!applicant || applicant.organizationId !== organizationId) throw new Error('Applicant not found.')
    if (applicant.applicationId) {
      const applications = readApplications()
      const application = applications.find((item) => item.id === applicant.applicationId && item.organizationId === organizationId)
      if (!application) throw new Error('Application not found.')
      const applicationStatus: ApplicationItem['status'] = status === 'Interview'
        ? 'Interview'
        : status === 'Accepted'
          ? 'ACCEPTED'
          : status === 'Shortlisted'
            ? 'SHORTLISTED'
            : 'UNDER_REVIEW'
      writeApplications(applications.map((item) => item.id === application.id ? { ...item, status: applicationStatus } : item))
      return true
    }
    const statuses = readMockStorage<Record<string, ApplicantListItem['status']>>(applicantStatusStorageKey(organizationId), {})
    writeMockStorage(applicantStatusStorageKey(organizationId), { ...statuses, [applicantId]: status })
    return true
  },

  getStats(userId?: string): DemoOpportunityStats {
    const user = requireOrganization(userId)
    const items = readOpportunities().filter((item) => item.organizationId === getOwnerOrganizationId(user))
    const ids = new Set(items.map((item) => item.id))
    const applications = readApplications().filter((item) => ids.has(item.opportunityId ?? ''))
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return {
      total: items.length,
      published: items.filter((item) => item.status === 'PUBLISHED').length,
      drafts: items.filter((item) => item.status === 'DRAFT').length,
      closed: items.filter((item) => item.status === 'CLOSED').length,
      applicants: applications.length + demoApplicants.filter((item) => item.organizationId === getOwnerOrganizationId(user)).length,
      recentApplications: applications.filter((item) => item.appliedAt && new Date(item.appliedAt).getTime() >= weekAgo).length,
    }
  },

  async listOpportunities(filters: OpportunityFilters, signal?: AbortSignal): Promise<OpportunityListResult> {
    if (signal?.aborted) throw new DOMException('The request was aborted.', 'AbortError')
    const results = await this.getOpportunities(filters)
    if (signal?.aborted) throw new DOMException('The request was aborted.', 'AbortError')
    return { items: results.map(toPublicOpportunity), total: results.length }
  },

  async getOpportunity(id: string, signal?: AbortSignal) {
    if (signal?.aborted) throw new DOMException('The request was aborted.', 'AbortError')
    const item = await this.getOpportunityById(id)
    if (signal?.aborted) throw new DOMException('The request was aborted.', 'AbortError')
    return toPublicOpportunity(item)
  },

  async getOrganizationOpportunity(id: string, userId?: string) {
    const user = requireOrganization(userId)
    const item = readOpportunities().find((opportunity) => opportunity.id === id)
    if (!item) throw new Error('Opportunity not found.')
    ensureOwner(item, user)
    return toOrganizationOpportunity(item)
  },

  async updateOrganizationOpportunity(id: string, payload: OpportunityUpdatePayload, userId?: string) {
    const result = await this.updateOpportunity(id, payload, userId)
    return toOrganizationOpportunity(result)
  },

  async publishOrganizationOpportunity(id: string, userId?: string) {
    const result = await this.publishOpportunity(id, userId)
    return toOrganizationOpportunity(result)
  },

  async deleteOrganizationOpportunity(id: string, userId?: string) {
    return this.deleteOpportunity(id, userId)
  },

  async getStudentProfile(userId?: string) {
    const user = requireStudent(userId)
    return readMockStorage<ProfileFormState>(profileStorageKey(user.id), DEFAULT_PROFILE)
  },

  async saveStudentProfile(profile: ProfileFormState, userId?: string) {
    const user = requireStudent(userId)
    writeMockStorage(profileStorageKey(user.id), profile)
    return profile
  },

  async getOrganizationProfile(userId?: string) {
    const user = requireOrganization(userId)
    return readMockStorage<OrganizationProfileFormState>(
      organizationProfileStorageKey(getOwnerOrganizationId(user)),
      { ...DEFAULT_ORG_PROFILE, name: user.organizationName ?? DEFAULT_ORG_PROFILE.name, contactName: `${user.firstName} ${user.lastName}`, contactEmail: user.email },
    )
  },

  async saveOrganizationProfile(profile: OrganizationProfileFormState, userId?: string) {
    const user = requireOrganization(userId)
    writeMockStorage(organizationProfileStorageKey(getOwnerOrganizationId(user)), profile)
    return profile
  },

  getNotifications(userId?: string) {
    const user = sessionUser(userId)
    const key = `${NOTIFICATION_KEY}_${user?.id ?? 'anonymous'}`
    return readMockStorage<StudentNotificationItem[]>(key, STUDENT_NOTIFICATIONS)
  },

  markNotificationRead(id: string, userId?: string) {
    const user = sessionUser(userId)
    const key = `${NOTIFICATION_KEY}_${user?.id ?? 'anonymous'}`
    const notifications = readMockStorage<StudentNotificationItem[]>(key, STUDENT_NOTIFICATIONS)
    writeMockStorage(key, notifications.map((item) => item.id === id ? { ...item, read: true } : item))
  },

  markAllNotificationsRead(userId?: string) {
    const user = sessionUser(userId)
    const key = `${NOTIFICATION_KEY}_${user?.id ?? 'anonymous'}`
    const notifications = readMockStorage<StudentNotificationItem[]>(key, STUDENT_NOTIFICATIONS)
    writeMockStorage(key, notifications.map((item) => ({ ...item, read: true })))
  },

  getOrganizationNotifications(userId?: string) {
    const user = requireOrganization(userId)
    const key = `${ORGANIZATION_NOTIFICATION_KEY}_${user.id}`
    return readMockStorage<NotificationItem[]>(key, NOTIFICATIONS)
  },

  markOrganizationNotificationRead(id: string, userId?: string) {
    const user = requireOrganization(userId)
    const key = `${ORGANIZATION_NOTIFICATION_KEY}_${user.id}`
    const items = readMockStorage<NotificationItem[]>(key, NOTIFICATIONS)
    writeMockStorage(key, items.map((item) => item.id === id ? { ...item, read: true } : item))
  },

  markAllOrganizationNotificationsRead(userId?: string) {
    const user = requireOrganization(userId)
    const key = `${ORGANIZATION_NOTIFICATION_KEY}_${user.id}`
    const items = readMockStorage<NotificationItem[]>(key, NOTIFICATIONS)
    writeMockStorage(key, items.map((item) => ({ ...item, read: true })))
  },

  async getStudentAssessment(id: string) : Promise<StudentAssessment> {
    await Promise.resolve()
    return {
      id,
      title: 'Software Engineering Skills Assessment',
      instructions: 'Answer the technical and problem-solving questions below. Your answers are saved as a demo submission on this device.',
      timeLimitMinutes: 30,
      questions: [
        {
          id: `${id}-q1`,
          questionText: 'Describe how you would investigate and resolve an API endpoint that has become significantly slower.',
          questionType: 'TEXT',
          questionOrder: 1,
        },
        {
          id: `${id}-q2`,
          questionText: 'Which data structure is best suited to efficient key-value lookups?',
          questionType: 'MULTIPLE_CHOICE',
          questionOrder: 2,
          options: [
            { label: 'Array', value: 'array' },
            { label: 'Hash map', value: 'hash-map' },
            { label: 'Stack', value: 'stack' },
            { label: 'Queue', value: 'queue' },
          ],
        },
        {
          id: `${id}-q3`,
          questionText: 'What would you prioritize when reviewing code for a production release?',
          questionType: 'TEXT',
          questionOrder: 3,
        },
      ],
    }
  },

  saveAssessmentAttempt(assessmentId: string, answers: Record<string, string>, userId?: string) {
    const user = requireStudent(userId)
    const key = `opportunity_hub_assessment_attempts_${user.id}`
    const attempts = readMockStorage<Record<string, { answers: Record<string, string>; submittedAt: string }>[]>(key, [])
    writeMockStorage(key, [...attempts, { [assessmentId]: { answers, submittedAt: new Date().toISOString() } }])
  },
}

export const listOpportunities = opportunityService.listOpportunities.bind(opportunityService)
export const getOpportunity = opportunityService.getOpportunity.bind(opportunityService)
export const getOrganizationOpportunity = opportunityService.getOrganizationOpportunity.bind(opportunityService)
export const updateOrganizationOpportunity = opportunityService.updateOrganizationOpportunity.bind(opportunityService)
export const publishOrganizationOpportunity = opportunityService.publishOrganizationOpportunity.bind(opportunityService)
export const deleteOrganizationOpportunity = opportunityService.deleteOrganizationOpportunity.bind(opportunityService)
