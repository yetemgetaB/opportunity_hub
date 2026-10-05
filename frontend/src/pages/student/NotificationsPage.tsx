import { useEffect, useState } from 'react'
import StudentNotificationRow from '../../components/notifications/StudentNotificationRow'
import StudentNotificationTabs, { type StudentNotificationFilter } from '../../components/notifications/StudentNotificationTabs'
import type { StudentNotificationItem } from '../../types/studentNotification'
import { opportunityService } from '../../services/opportunityService'
import { useAuthContext } from '../../context/AuthContext'

export default function NotificationsPage() {
  const { user } = useAuthContext()
  const [items, setItems] = useState<StudentNotificationItem[]>([])
  const [filter, setFilter] = useState<StudentNotificationFilter>('all')

  useEffect(() => {
    setItems(opportunityService.getNotifications(user?.id))
  }, [user])

  const filtered = items.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.category === filter
  })

  function markAllRead() {
    opportunityService.markAllNotificationsRead(user?.id)
    setItems(opportunityService.getNotifications(user?.id))
  }

  function markOneRead(id: string) {
    opportunityService.markNotificationRead(id, user?.id)
    setItems(opportunityService.getNotifications(user?.id))
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-black">Notifications</h2>
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