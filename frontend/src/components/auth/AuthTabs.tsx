type Item = { label: string; active: boolean; onSelect: () => void }

export default function AuthTabs({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
      {items.map((i) => (
        <button
          key={i.label}
          type="button"
          role="tab"
          aria-selected={i.active}
          onClick={i.onSelect}
          className={`rounded-md py-2 text-xs font-semibold ${i.active ? 'bg-white text-navy shadow-sm' : 'text-slate-500'}`}
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}