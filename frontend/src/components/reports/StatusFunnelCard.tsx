import type { StatusFunnelStep } from '../../types/studentReport'

export default function StatusFunnelCard({ steps }: { steps: StatusFunnelStep[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-navy">Application Status</h2>
      <div className="mt-5 space-y-2.5">
        {steps.map((s) => (
          <div
            key={s.label}
            className="flex h-8 items-center justify-between rounded-md px-3 text-xs font-semibold text-white"
            style={{ width: `${s.percentOfTotal}%`, backgroundColor: s.color }}
          >
            <span>{s.label}</span>
            <span>{s.count}</span>
          </div>
        ))}
      </div>
    </section>
  )
}