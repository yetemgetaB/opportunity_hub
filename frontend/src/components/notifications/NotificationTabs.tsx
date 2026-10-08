export type NotificationFilter = 'all' | 'unread'

const tabs: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
]

export default function NotificationTabs({ active, onChange }: { active: NotificationFilter; onChange: (f: NotificationFilter) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
            active === t.id ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}