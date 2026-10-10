import type { ApplicationItem, ApplicationStatus } from '../../types/application'

type Stage = {
  label: string
  count: number
}

export default function ApplicationPipeline({ items }: { items: ApplicationItem[] }) {
  const count = (status: ApplicationStatus) => items.filter((item) => item.status === status).length
  const stages: Stage[] = [
    { label: 'Applied', count: items.length },
    { label: 'Under Review', count: count('UNDER_REVIEW') },
    { label: 'Shortlisted', count: count('SHORTLISTED') },
    { label: 'Interview Scheduled', count: count('INTERVIEW') },
    { label: 'Offer Accepted / Closed', count: items.filter((item) => ['ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(item.status)).length },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div>
        <h2 className="font-display text-xl font-bold text-navy">Application Pipeline</h2>
        <p className="mt-0.5 text-xs text-slate-500">Live progress tracking across active and completed applications</p>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <ol className="flex min-w-[680px] items-start">
          {stages.map((stage, index) => {
            const isCurrent = stage.count > 0
            return (
              <li key={stage.label} className="flex flex-1 items-start last:flex-none">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                  <span
                    className={`grid size-9 place-items-center rounded-xl text-xs font-bold transition shadow-xs ${
                      isCurrent
                        ? 'bg-amber-500 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {stage.count}
                  </span>
                  <span className={`max-w-32 text-xs font-semibold ${isCurrent ? 'text-navy' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`mt-4.5 h-0.5 w-8 shrink-0 transition ${stages[index + 1].count > 0 ? 'bg-amber-400' : 'bg-slate-200'}`}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
