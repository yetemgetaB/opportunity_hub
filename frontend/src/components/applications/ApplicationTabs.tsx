export type ApplicationFilter = 'all' | 'active' | 'previous'

type Props = {
  active: ApplicationFilter
  onChange: (f: ApplicationFilter) => void
  counts: Record<ApplicationFilter, number>
}

const tabs: { id: ApplicationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'previous', label: 'Previous' },
]

export default function ApplicationTabs({ active, onChange, counts }: Props) {
  return (
    <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
            active === t.id ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          {t.label} ({counts[t.id]})
        </button>
      ))}
    </div>
  )
}