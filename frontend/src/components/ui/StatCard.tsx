import Icon, { type IconName } from './Icon'

type Props = { label: string; value: number | string; note: string; icon: IconName }

export default function StatCard({ label, value, note, icon }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-navy">{value}</span>
        <span className="text-sm text-emerald-500">{note}</span>
      </p>
    </div>
  )
}