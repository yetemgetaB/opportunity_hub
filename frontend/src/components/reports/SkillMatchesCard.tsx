import Icon from '../ui/Icon'
import type { SkillMatchTag } from '../../types/studentReport'

export default function SkillMatchesCard({ skills }: { skills: SkillMatchTag[] }) {
  function handleExport() {
    // TODO: generate and download a real PDF report once the backend exists
    window.print()
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-navy">Top Skills Requested in Your Matches</h2>
        <button onClick={handleExport} className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline">
          <Icon name="download" className="h-3.5 w-3.5" />
          Export PDF
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {skills.map((s) => (
          <span
            key={s.skill}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              s.highlighted ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {s.skill} · {s.matches} matches
          </span>
        ))}
      </div>
    </section>
  )
}