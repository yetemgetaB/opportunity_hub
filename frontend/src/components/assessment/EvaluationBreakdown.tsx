import type { EvaluationBreakdownItem } from '../../types/organization'

export default function EvaluationBreakdown({ items }: { items: EvaluationBreakdownItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Evaluation Breakdown</h2>
      <div className="mt-5 space-y-5">
        {items.map((i) => (
          <div key={i.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{i.label}</span>
              <span className="font-semibold text-amber-600">{i.value}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${i.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}