type Item = { label: string; active: boolean; onSelect: () => void };

export default function AuthTabs({ items }: { items: Item[] }) {
  return (
    <div
      className="mx-auto grid w-full max-w-96 grid-cols-2 gap-1 rounded-[10px] bg-gray-100 p-1"
      role="tablist"
    >
      {items.map((i) => (
        <button
          key={i.label}
          type="button"
          role="tab"
          aria-selected={i.active}
          onClick={i.onSelect}
          className={`whitespace-nowrap rounded-lg px-2 py-2 text-xs ${i.active ? "bg-white font-semibold text-slate-900 shadow-sm" : "font-medium text-gray-500"}`}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}
