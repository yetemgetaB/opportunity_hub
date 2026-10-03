import { useState } from 'react'
import StudentNotificationRow from '../../components/notifications/StudentNotificationRow'
import StudentNotificationTabs, { type StudentNotificationFilter } from '../../components/notifications/StudentNotificationTabs'
import { STUDENT_NOTIFICATIONS } from '../../utils/studentData'
import type { StudentNotificationItem } from '../../types/studentNotification'

export default function NotificationsPage() {
  const [items, setItems] = useState<StudentNotificationItem[]>(STUDENT_NOTIFICATIONS)
  const [filter, setFilter] = useState<StudentNotificationFilter>('all')

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
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">Updates on your applications and saved opportunities.</p>
        </div>
        <button onClick={markAllRead} className="text-xs font-semibold text-brand hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="mt-5">
        <StudentNotificationTabs active={filter} onChange={setFilter} />
      </div>

      <ul className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <li className="px-5 py-10 text-center text-sm text-slate-500">Nothing here yet.</li>
        ) : (
          filtered.map((n) => <StudentNotificationRow key={n.id} n={n} onRead={markOneRead} />)
        )}
      </ul>
    </div>
  )
}