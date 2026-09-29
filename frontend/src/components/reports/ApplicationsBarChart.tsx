import type { MonthlyApplications } from '../../types/studentReport'

export default function ApplicationsBarChart({ data }: { data: MonthlyApplications[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-navy">Applications Sent</h2>
      <p className="text-xs text-slate-400">Last {data.length} months</p>
      <div className="mt-6 flex h-36 items-end gap-4 px-1">
        {data.map((d, i) => {
          const isLast = i === data.length - 1
          return (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`w-full max-w-8 rounded-t ${isLast ? 'bg-navy' : 'bg-brand'}`}
                style={{ height: `${(d.count / max) * 100}%` }}
                title={`${d.count} applications`}
              />
              <span className="text-xs text-slate-400">{d.month}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}