import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Toast, { type ToastState } from '../components/ui/Toast'
import { useAuthContext } from './AuthContext'
import { opportunityService } from '../services/opportunityService'

const TOAST_MS = 3500

export type SavedEntry = { id: string; savedAt: number }

interface SavedContextValue {
  saved: SavedEntry[] // newest first
  isSaved: (opportunityId: string) => boolean
  toggleSaved: (opportunityId: string) => void
}

const SavedContext = createContext<SavedContextValue | undefined>(undefined)

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const [saved, setSaved] = useState<SavedEntry[]>([])
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const counter = useRef(0)

  useEffect(() => {
    if (user?.role !== 'STUDENT') {
      setSaved([])
      return
    }
    setSaved(opportunityService.getSavedOpportunities(user.id).map(({ entry }) => entry))
  }, [user])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const closeToast = useCallback(() => {
    window.clearTimeout(timer.current)
    setToast(null)
  }, [])

  const showToast = useCallback((next: Omit<ToastState, 'id'>) => {
    window.clearTimeout(timer.current)
    counter.current += 1
    setToast({ ...next, id: counter.current })
    timer.current = window.setTimeout(() => setToast(null), TOAST_MS)
  }, [])

  const isSaved = useCallback((opportunityId: string) => saved.some((e) => e.id === opportunityId), [saved])

  const toggleSaved = useCallback(
    (opportunityId: string) => {
      if (user?.role !== 'STUDENT') {
        showToast({
          variant: 'removed',
          message: 'Sign in with a student account to manage saved opportunities.',
          action: { label: 'Sign in', to: '/login' },
        })
        return
      }
      const existing = saved.find((e) => e.id === opportunityId)
      const opportunity = opportunityService.findOpportunity(opportunityId)
      const detail = opportunity ? `${opportunity.title} · ${opportunity.company}` : undefined

      if (existing) {
        try {
          opportunityService.unsaveOpportunity(opportunityId, user?.id)
        } catch (cause) {
          showToast({
            variant: 'removed',
            message: cause instanceof Error ? cause.message : 'Unable to remove this saved opportunity.',
          })
          return
        }
        setSaved((prev) => prev.filter((e) => e.id !== opportunityId))
        showToast({
          variant: 'removed',
          message: 'Removed from Saved',
          detail,
          action: {
            label: 'Undo',
            onClick: () => {
              try {
                opportunityService.saveOpportunity(opportunityId, user?.id)
                setSaved((prev) =>
                  prev.some((e) => e.id === existing.id) ? prev : [...prev, existing].sort((a, b) => b.savedAt - a.savedAt),
                )
                showToast({ variant: 'saved', message: 'Back in your Saved list', detail })
              } catch (cause) {
                showToast({ variant: 'removed', message: cause instanceof Error ? cause.message : 'Unable to restore this saved opportunity.' })
              }
            },
          },
        })
      } else {
        try {
          opportunityService.saveOpportunity(opportunityId, user?.id)
          const savedAt = Date.now()
          setSaved((prev) => [{ id: opportunityId, savedAt }, ...prev])
        } catch (cause) {
          showToast({
            variant: 'removed',
            message: cause instanceof Error ? cause.message : 'Unable to save this opportunity.',
          })
          return
        }
        showToast({
          variant: 'saved',
          message: 'Saved to your list',
          detail,
          action: { label: 'View Saved', to: '/student/saved' },
        })
      }
    },
    [saved, showToast, user],
  )

  const value = useMemo(() => ({ saved, isSaved, toggleSaved }), [saved, isSaved, toggleSaved])

  return (
    <SavedContext.Provider value={value}>
      {children}
      <Toast toast={toast} onClose={closeToast} />
    </SavedContext.Provider>
  )
}

export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved must be used within a SavedProvider')
  return ctx
}