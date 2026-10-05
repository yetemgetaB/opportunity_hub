import { useEffect, useState } from 'react'
import NotificationRow from '../../components/notifications/NotificationRow'
import NotificationTabs, { type NotificationFilter } from '../../components/notifications/NotificationTabs'
import type { NotificationItem } from '../../types/organization'
import { opportunityService } from '../../services/opportunityService'
import { useAuthContext } from '../../context/AuthContext'

export default function NotificationsPage() {
  const { user } = useAuthContext()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      setItems(opportunityService.getOrganizationNotifications(user?.id))
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load notifications.')
    }
  }, [user])

  const filtered = items.filter((n) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.category === filter
  })

  function markAllRead() {
    try {
      opportunityService.markAllOrganizationNotificationsRead(user?.id)
      setItems(opportunityService.getOrganizationNotifications(user?.id))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update notifications.')
    }
  }

  function markOneRead(id: string) {
    try {
      opportunityService.markOrganizationNotificationRead(id, user?.id)
      setItems(opportunityService.getOrganizationNotifications(user?.id))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update notifications.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-black">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">Stay on top of applicant and hiring activity.</p>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
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