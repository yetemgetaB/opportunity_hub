import type { ApplicationStatus } from '../types/application'

export function normalizeApplicationStatus(status: ApplicationStatus) {
  switch (status) {
    case 'SUBMITTED': return 'Submitted'
    case 'UNDER_REVIEW': return 'Under Review'
    case 'SHORTLISTED': return 'Shortlisted'
    case 'INTERVIEW': return 'Interview'
    case 'ACCEPTED': return 'Accepted'
    case 'REJECTED': return 'Rejected'
    case 'WITHDRAWN': return 'Withdrawn'
  }
}

export function isPrevious(status: ApplicationStatus) {
  return ['ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(status)
}

export function applicationOrganizationName(item: { opportunity?: { organization?: { name?: string } | string | null } }) {
  const organization = item.opportunity?.organization
  return typeof organization === 'string' ? organization : organization?.name ?? 'Organization'
}

export function applicationDateLabel(value?: string) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString()
}
