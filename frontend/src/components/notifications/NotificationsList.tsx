/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import NotificationRow from './NotificationRow'
import NotificationTabs, { type NotificationFilter } from './NotificationTabs'
import { useNotifications } from '../../context/NotificationsContext'
import { getNotifications, markNotificationAsRead } from '../../services/notificationService'
import type { NotificationRecord } from '../../types/notification'
import { timeAgo } from '../../utils/timeAgo'
import type { NotificationItem } from '../../types/organization'

function formatTime(createdAt: string): string {
  const timestamp = Date.parse(createdAt)
  return Number.isNaN(timestamp) ? 'Date unavailable' : timeAgo(timestamp)
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to load notifications.'
}

export default function NotificationsList({ description }: { description: string }) {
  const { updateUnreadCount } = useNotifications()
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(() => new Set())

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getNotifications()
      setNotifications(result)
      updateUnreadCount(result.filter((notification) => !notification.isRead).length)
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [updateUnreadCount])

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  async function handleRead(id: string) {
    const notification = notifications.find((item) => item.id === id)
    if (!notification || notification.isRead || updatingIds.has(id)) return

    setError(null)
    setUpdatingIds((current) => new Set(current).add(id))
    try {
      await markNotificationAsRead(id)
      setNotifications((current) =>
        current.map((item) => item.id === id ? { ...item, isRead: true } : item),
      )
      updateUnreadCount((count) => Math.max(0, count - 1))
    } catch (readError: unknown) {
      setError(getErrorMessage(readError))
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
    }
  }

  const visibleNotifications = notifications.filter(
    (notification) => activeFilter === 'all' || !notification.isRead,
  )

  function toNotificationItem(notification: NotificationRecord): NotificationItem {
    return {
      id: notification.id,
      title: notification.title,
      description: notification.content,
      time: formatTime(notification.createdAt),
      read: notification.isRead,
      icon: 'bell',
      iconStyle: 'bg-brand/10 text-brand',
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header>
        <h1 className="font-display text-2xl font-bold text-navy">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </header>

      <div className="mt-6">
        <NotificationTabs active={activeFilter} onChange={setActiveFilter} />
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <p>{error}</p>
          {!notifications.length && (
            <button type="button" onClick={() => void loadNotifications()} className="shrink-0 font-semibold underline">
              Try again
            </button>
          )}
        </div>
      )}

      <section className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white" aria-label="Notifications">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500" role="status">Loading notifications...</p>
        ) : visibleNotifications.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            {notifications.length === 0 ? 'You do not have any notifications yet.' : 'You have no unread notifications.'}
          </p>
        ) : (
          <ul>
            {visibleNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                n={toNotificationItem(notification)}
                onRead={(id) => void handleRead(id)}
                isUpdating={updatingIds.has(notification.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
