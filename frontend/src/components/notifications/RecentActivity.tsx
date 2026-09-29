import Icon, { type IconName } from '../ui/Icon'
import type { ActivityItem } from '../../types/student'

const iconMap: Record<ActivityItem['icon'], IconName> = {
  file: 'file',
  sparkles: 'sparkles',
  bookmark: 'bookmark',
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Recent Activity</h2>
      <ul className="mt-4 space-y-5">
        {items.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-600">
              <Icon name={iconMap[a.icon]} className="h-4 w-4" />
            </span>
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-navy">{a.title}</p>
              <p className="text-xs text-slate-400">{a.time}</p>
              <p className="mt-1 text-xs text-slate-600">{a.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}