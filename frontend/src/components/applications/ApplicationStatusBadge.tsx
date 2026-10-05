import type { ApplicationStatus } from '../../types/application'
import { normalizeApplicationStatus } from '../../utils/applicationData'

const styles: Record<ReturnType<typeof normalizeApplicationStatus>, string> = {
  'Under Review': 'bg-amber-100 text-amber-600',
  Interview: 'bg-blue-100 text-blue-600',
  Shortlisted: 'bg-emerald-100 text-emerald-600',
  Accepted: 'bg-emerald-100 text-emerald-600',
  Rejected: 'bg-red-100 text-red-600',
  Withdrawn: 'bg-slate-100 text-slate-600',
}

export default function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const normalizedStatus = normalizeApplicationStatus(status)
  const label = normalizedStatus === 'Interview' ? 'Interview Scheduled' : normalizedStatus
  return <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${styles[normalizedStatus]}`}>{label}</span>
}