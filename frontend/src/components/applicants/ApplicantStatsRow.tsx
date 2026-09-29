import { APPLICANT_STATS } from '../../utils/organizationData'

const stats = [
  { label: 'Total Applicants', value: APPLICANT_STATS.total, color: 'text-navy' },
  { label: 'Shortlisted', value: APPLICANT_STATS.shortlisted, color: 'text-emerald-500' },
  { label: 'In Assessment', value: APPLICANT_STATS.inAssessment, color: 'text-amber-500' },
  { label: 'Accepted', value: APPLICANT_STATS.accepted, color: 'text-blue-500' },
]

export default function ApplicantStatsRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">{s.label}</p>
          <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}