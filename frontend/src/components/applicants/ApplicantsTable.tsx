import { Link } from 'react-router-dom'
import MatchScoreBar from './MatchScoreBar'
import type { ApplicantListItem, ApplicantStatus } from '../../types/organization'

const statusStyles: Record<ApplicantStatus, string> = {
  'Under Review': 'bg-amber-100 text-amber-600',
  Interview: 'bg-blue-100 text-blue-600',
  Shortlisted: 'bg-emerald-100 text-emerald-600',
  Accepted: 'bg-navy/10 text-navy',
}

export default function ApplicantsTable({ applicants }: { applicants: ApplicantListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
            <th className="w-10 px-4 py-3">
              <input type="checkbox" aria-label="Select all applicants" />
            </th>
            <th className="px-4 py-3 font-medium">Applicant Name</th>
            <th className="px-4 py-3 font-medium">AI Match Score</th>
            <th className="px-4 py-3 font-medium">Skills Match</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date Applied</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((a) => (
            <tr key={a.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-4">
                <input type="checkbox" aria-label={`Select ${a.name}`} />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">
                    {a.initials}
                  </span>
                  <span className="font-semibold text-navy">{a.name}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <MatchScoreBar score={a.matchScore} tier={a.matchTier} />
              </td>
              <td className="px-4 py-4 text-slate-600">{a.skillsMatch}%</td>
              <td className="px-4 py-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[a.status]}`}>{a.status}</span>
              </td>
              <td className="px-4 py-4 text-slate-600">{a.dateApplied}</td>
              <td className="px-4 py-4 text-right">
                <Link
                  to={`/organization/applicants/${a.id}`}
                    className="inline-block rounded-md bg-navy px-4 py-2 text-xs font-semibold !text-white hover:bg-navy-light"                >
                  View Profile
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}