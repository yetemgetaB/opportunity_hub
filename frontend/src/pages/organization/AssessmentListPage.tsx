import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { APPLICANTS, APPLICANTS_OPPORTUNITY_TITLE } from '../../utils/organizationData'
import type { ApplicantStatus } from '../../types/organization'

const statusStyles: Record<ApplicantStatus, string> = {
  'Under Review': 'bg-amber-100 text-amber-600',
  Interview: 'bg-blue-100 text-blue-600',
  Shortlisted: 'bg-emerald-100 text-emerald-600',
  Accepted: 'bg-navy/10 text-navy',
}

export default function AssessmentListPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-navy">AI Assessment</h2>
      <p className="mt-1 text-sm text-slate-500">Review AI-scored evaluations for every applicant.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {APPLICANTS.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">
                      {a.initials}
                    </span>
                    <span className="font-semibold text-navy">{a.name}</span>
                  </div>
                </td>
                {/* TODO: swap this for the applicant's actual opportunity once each one can apply to different postings */}
                <td className="px-4 py-4 text-slate-600">{APPLICANTS_OPPORTUNITY_TITLE}</td>
                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[a.status]}`}>{a.status}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to={`/organization/applicants/${a.id}/assessment`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-navy hover:brightness-110"
                  >
                    <Icon name="sparkles" className="h-3.5 w-3.5" />
                    View Assessment
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}