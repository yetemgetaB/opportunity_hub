import Icon from '../ui/Icon'

export type ApplicationFilter = 'all' | 'active' | 'previous'

type Props = {
  active: ApplicationFilter
  onChange: (f: ApplicationFilter) => void
  counts: Record<ApplicationFilter, number>
  onExport: () => void
}

const tabs: { id: ApplicationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'previous', label: 'Completed' },
]

export default function ApplicationTabs({ active, onChange, counts, onExport }: Props) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <div className="inline-flex flex-wrap gap-2" role="tablist" aria-label="Filter applications">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            onClick={() => onChange(t.id)}
            className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
              active === t.id
                ? 'bg-slate-800 text-white'
                : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t.label} ({counts[t.id]})
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onExport}
        className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
      >
        <Icon name="download" className="h-3.5 w-3.5" />
        Export Tracker
      </button>
    </div>
  )
}