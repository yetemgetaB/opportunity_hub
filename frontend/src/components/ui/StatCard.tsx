import Icon, { type IconName } from './Icon'

type Props = { label: string; value: number | string; note: string; icon: IconName }

export default function StatCard({ label, value, note, icon }: Props) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className="grid size-9 place-items-center rounded-lg bg-slate-800/0 text-navy">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="dark-stat-value font-display text-3xl font-bold text-black">{value}</span>
        <span className="text-xs font-semibold text-amber-500">{note}</span>
      </p>
    </article>
  )
}