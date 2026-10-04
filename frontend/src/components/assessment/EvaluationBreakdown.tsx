import type { EvaluationBreakdownItem } from '../../types/organization'

export default function EvaluationBreakdown({ items }: { items: EvaluationBreakdownItem[] }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assessment results</p>
          <h2 className="mt-1 font-display text-lg font-bold text-navy">Evaluation Breakdown</h2>
        </div>
        <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
          {items.length} criteria
        </span>
      </div>
      <div className="mt-6 space-y-5">
        {items.map((item) => {
          const progress = Math.min(100, Math.max(0, item.value))

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-600">{item.label}</span>
                <span className="shrink-0 font-semibold text-amber-600">{item.value}%</span>
              </div>
              <div
                role="progressbar"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"
              >
                <div className="h-full rounded-full bg-amber-500 transition-[width]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}