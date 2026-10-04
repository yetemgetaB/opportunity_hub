import type { MatchBreakdownItem } from '../../types/student'

const dotColors = ['bg-amber-500', 'bg-navy', 'bg-slate-300']

export default function MatchBreakdownChart({ overall, items }: { overall: number; items: MatchBreakdownItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-navy">AI Match Breakdown</h2>
      <p className="mt-1 text-xs text-slate-500">Based on your skills, experiences, and academic alignment.</p>

      <div
        className="relative mx-auto mt-6 h-28 w-28 rounded-full"
        style={{ background: `conic-gradient(#f3a311 ${overall * 3.6}deg, #e5e5e5 0deg)` }}
      >
        <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-xl font-bold text-navy">{overall}%</span>
          <span className="text-[10px] text-slate-400">Overall</span>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {items.map((i, idx) => (
          <li key={i.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-600">
              <span className={`h-2 w-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
              {i.label}
            </span>
            <span className="font-semibold text-navy">{i.value}%</span>
          </li>
        ))}
      </ul>
    </section>
  )
}