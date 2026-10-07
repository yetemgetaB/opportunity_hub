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
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Application Pipeline Stage</h2>
        <p className="mt-1 text-sm text-slate-500">Active tracking of recruitment stages</p>
      </div>

      <div className="mt-5 overflow-x-auto pb-1">
        <ol className="flex min-w-[680px] items-start">
          {stages.map((stage, index) => {
            const isCurrent = stage.count > 0
            return (
              <li key={stage.label} className="flex flex-1 items-start last:flex-none">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 text-sm font-bold ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-500 text-slate-800'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {stage.count}
                  </span>
                  <span className={`max-w-32 text-xs font-semibold ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                    {stage.label}
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`mt-4 h-0.5 w-8 shrink-0 ${stages[index + 1].count > 0 ? 'bg-amber-500' : 'bg-slate-200'}`}
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
