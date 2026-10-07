import type { OpportunityApplicant } from '../services/applicationService'
import type { ApplicantListItem } from '../types/organization'

export function toApplicantListItem(applicant: OpportunityApplicant, opportunityId: string, position: string): ApplicantListItem {
  const { student, application } = applicant
  const name = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')
  const initials = [student.firstName, student.lastName].filter(Boolean).map((part) => part[0]).join('').toUpperCase()
  const appliedAt = new Date(application.appliedAt)
  return {
    id: application.id,
    studentId: student.id,
    opportunityId,
    name,
    initials,
    position,
    university: student.profile.university,
    fieldOfStudy: student.profile.fieldOfStudy,
    status: application.status,
    dateApplied: Number.isNaN(appliedAt.getTime()) ? 'Date unavailable' : appliedAt.toLocaleDateString(),
  }
}

export function applicationStatusLabel(status: ApplicantListItem['status']) {
  const labels: Record<ApplicantListItem['status'], string> = {
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW: 'Interview',
    REJECTED: 'Rejected',
    ACCEPTED: 'Accepted',
    WITHDRAWN: 'Withdrawn',
  }
  return labels[status]
}
