import Icon from '../ui/Icon'

export default function KeyStrengthsCard({ items }: { items: string[] }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-navy">Key Strengths</h2>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-500/10 text-amber-600">
          <Icon name="check" className="h-4 w-4" />
        </span>
      </div>
      <ul className="mt-5 space-y-4">
        {items.map((strength) => (
          <li key={strength} className="flex gap-3 text-sm leading-5 text-slate-600">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>{strength}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}