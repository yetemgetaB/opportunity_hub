/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { useAuthContext } from './AuthContext'
import { getUnreadNotificationCount } from '../services/notificationService'

interface NotificationsContextValue {
  unreadCount: number
  unreadCountError: string | null
  updateUnreadCount: Dispatch<SetStateAction<number>>
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadCountError, setUnreadCountError] = useState<string | null>(null)
  const unreadCountVersion = useRef(0)
  const updateUnreadCount = useCallback((count: SetStateAction<number>) => {
    unreadCountVersion.current += 1
    setUnreadCount(count)
    setUnreadCountError(null)
  }, [])

  useEffect(() => {
    let active = true
    setUnreadCount(0)
    setUnreadCountError(null)
    if (!user) return
    const requestVersion = unreadCountVersion.current

    getUnreadNotificationCount()
      .then((count) => {
        if (active && requestVersion === unreadCountVersion.current) updateUnreadCount(count)
      })
      .catch((error: unknown) => {
        if (active) {
          setUnreadCountError(error instanceof Error ? error.message : 'Unable to load unread notifications.')
        }
      })

    return () => {
      active = false
    }
  }, [user, updateUnreadCount])

  const value = useMemo(
    () => ({ unreadCount, unreadCountError, updateUnreadCount }),
    [unreadCount, unreadCountError, updateUnreadCount],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider')
  return context
}
