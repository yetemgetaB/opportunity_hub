import Icon, { type IconName } from '../ui/Icon'
import type { ActivityItem } from '../../types/student'

const iconMap: Record<ActivityItem['icon'], IconName> = {
  file: 'file',
  sparkles: 'sparkles',
  bookmark: 'bookmark',
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-black">Recent Activity</h2>
      <ul className="mt-5 space-y-4">
        {items.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
              <Icon name={iconMap[a.icon]} className="h-4 w-4" />
            </span>
            <div className="min-w-0 text-sm">
              <p className="text-xs font-semibold text-black">{a.title}</p>
              <p className="mt-1 text-xs text-gray-500">{a.time}</p>
              <p className="mt-1 text-xs leading-4 text-gray-500">{a.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}