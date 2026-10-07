import { Link } from 'react-router-dom'
import type { ApplicantListItem, ApplicantStatus } from '../../types/organization'
import { applicationStatusLabel } from '../../utils/applicantData'

const statusStyles: Record<ApplicantStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-600',
  UNDER_REVIEW: 'bg-amber-100 text-amber-600',
  INTERVIEW: 'bg-blue-100 text-blue-600',
  SHORTLISTED: 'bg-emerald-100 text-emerald-600',
  ACCEPTED: 'bg-navy/10 text-navy',
  REJECTED: 'bg-red-100 text-red-600',
  WITHDRAWN: 'bg-slate-100 text-slate-600',
}

interface ApplicantsTableProps {
  applicants: ApplicantListItem[]
  selectedIds: string[]
  onToggleApplicant: (id: string) => void
  allSelected: boolean
  onToggleAll: () => void
}

export default function ApplicantsTable({
  applicants,
  selectedIds,
  onToggleApplicant,
  allSelected,
  onToggleAll,
}: ApplicantsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                aria-label="Select all applicants"
                checked={allSelected}
                onChange={onToggleAll}
                className="h-4 w-4 rounded border-slate-300 accent-brand"
              />
            </th>
            <th className="px-4 py-3">Applicant Name</th>
            <th className="px-4 py-3">Opportunity</th>
            <th className="px-4 py-3">University</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date Applied</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applicants.length > 0 ? applicants.map((a) => (
            <tr key={a.id} className="transition-colors hover:bg-slate-50/70">
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  aria-label={`Select ${a.name}`}
                  checked={selectedIds.includes(a.id)}
                  onChange={() => onToggleApplicant(a.id)}
                  className="h-4 w-4 rounded border-slate-300 accent-brand"
                />
              </td>
              <td className="px-4 py-4">
                <div className="flex min-w-40 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">
                    {a.initials}
                  </span>
                  <span className="font-semibold text-navy">{a.name}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-slate-600">{a.position}</td>
              <td className="px-4 py-4 text-slate-600">{a.university}</td>
              <td className="px-4 py-4">
                <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[a.status]}`}>{applicationStatusLabel(a.status)}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-slate-500">{a.dateApplied}</td>
              <td className="px-4 py-4 text-right">
                <Link
                  to={`/organization/applicants/${a.id}`}
                  className="inline-block whitespace-nowrap rounded-md bg-navy px-3 py-2 text-xs font-semibold text-white transition hover:bg-navy-light"
                >
                  View Profile
                </Link>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                No applicants match this status.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}