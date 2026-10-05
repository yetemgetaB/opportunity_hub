import type { ApplicantListItem } from '../../types/organization'

export default function ApplicantStatsRow({ applicants }: { applicants: ApplicantListItem[] }) {
  const stats = [
    { label: 'Total Applicants', value: applicants.length, color: 'text-navy' },
    { label: 'Shortlisted', value: applicants.filter((item) => item.status === 'Shortlisted').length, color: 'text-emerald-500' },
    { label: 'In Assessment', value: applicants.filter((item) => item.status === 'Interview').length, color: 'text-amber-500' },
    { label: 'Accepted', value: applicants.filter((item) => item.status === 'Accepted').length, color: 'text-blue-500' },
  ]

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