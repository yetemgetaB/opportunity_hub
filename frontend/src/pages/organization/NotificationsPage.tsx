import { useState } from 'react'
import NotificationRow from '../../components/notifications/NotificationRow'
import NotificationTabs, { type NotificationFilter } from '../../components/notifications/NotificationTabs'
import { NOTIFICATIONS } from '../../utils/organizationData'
import type { NotificationItem } from '../../types/organization'

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>(NOTIFICATIONS)
  const [filter, setFilter] = useState<NotificationFilter>('all')

  const filtered = items.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.category === filter
  })

  function markAllRead() {
    // TODO: call notificationService.markAllRead() once the backend exists
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markOneRead(id: string) {
    // TODO: call notificationService.markRead(id) once the backend exists
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-black">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">Stay on top of applicant and hiring activity.</p>
        </div>
        <button onClick={markAllRead} className="text-xs font-semibold text-brand hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="mt-5">
        <NotificationTabs active={filter} onChange={setFilter} />
      </div>

      <ul className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {filtered.length === 0 ? (
          <li className="px-5 py-10 text-center text-sm text-slate-500">Nothing here yet.</li>
        ) : (
          filtered.map((n) => <NotificationRow key={n.id} n={n} onRead={markOneRead} />)
        )}
      </ul>
    </div>
  )
}