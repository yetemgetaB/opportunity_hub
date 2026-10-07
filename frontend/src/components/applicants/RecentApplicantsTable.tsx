import { Link } from 'react-router-dom'
import type { ApplicantStatus, RecentApplicant } from '../../types/organization'
import { applicationStatusLabel } from '../../utils/applicantData'

const statusStyles: Record<ApplicantStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-600',
  UNDER_REVIEW: 'bg-amber-100 text-amber-600',
  INTERVIEW: 'bg-blue-100 text-blue-600',
  SHORTLISTED: 'bg-emerald-100 text-emerald-600',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
  WITHDRAWN: 'bg-slate-100 text-slate-600',
}

export default function RecentApplicantsTable({ applicants }: { applicants: RecentApplicant[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-navy">Recent Applicants</h2>
        <Link to="/organization/applicants" className="text-xs font-semibold text-brand hover:underline">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">
                      {a.initials}
                    </span>
                    <Link to={`/organization/applicants/${a.id}`} className="font-semibold text-navy hover:underline">{a.name}</Link>
                  </div>
                </td>
                <td className="px-4 py-5 text-slate-600">{a.position}</td>
                <td className="px-4 py-5">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[a.status]}`}>{applicationStatusLabel(a.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
