type Tab = 'profile' | 'cv' | 'test' | 'analysis'

const tabs: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'cv', label: 'CV / Resume' },
  { id: 'test', label: 'Test Answers' },
  { id: 'analysis', label: 'AI Analysis' },
]

export default function ApplicantTabs({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="-mx-1 flex gap-5 overflow-x-auto border-b border-slate-200 px-1 sm:gap-6" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px shrink-0 border-b-2 px-1 py-3 text-sm font-semibold transition ${
            active === t.id ? 'border-brand text-brand' : 'border-transparent text-slate-500 hover:text-navy'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}