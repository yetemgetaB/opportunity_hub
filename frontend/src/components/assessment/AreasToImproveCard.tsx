import Icon from '../ui/Icon'

export default function AreasToImproveCard({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Areas to Improve</h2>
      <ul className="mt-4 space-y-3">
        {items.map((s) => (
          <li key={s} className="flex gap-2.5 text-sm text-slate-600">
            <Icon name="alertTriangle" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            {s}
          </li>
        ))}
      </ul>
    </section>
  )
}