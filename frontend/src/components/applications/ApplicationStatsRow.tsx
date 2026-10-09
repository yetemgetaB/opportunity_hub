import { isPrevious } from '../../utils/applicationData'
import type { ApplicationItem } from '../../types/application'

export default function ApplicationStatsRow({ items }: { items: ApplicationItem[] }) {
  const stats = [
    { label: 'Total Applied', value: items.length, color: 'text-navy' },
    { label: 'Active', value: items.filter((a) => !isPrevious(a.status)).length, color: 'text-amber-500' },
    { label: 'Interviews', value: items.filter((a) => a.status === 'INTERVIEW').length, color: 'text-blue-500' },
    { label: 'Previous', value: items.filter((a) => isPrevious(a.status)).length, color: 'text-slate-500' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">{s.label}</p>
          <p className={`dark-stat-value mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}