import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Toast, { type ToastState } from '../components/ui/Toast'
import { OPPORTUNITIES } from '../utils/studentData'

const STORAGE_KEY = 'opportunity-hub-saved'
const TOAST_MS = 3500
const DAY_MS = 24 * 60 * 60 * 1000

export type SavedEntry = { id: string; savedAt: number }

interface SavedContextValue {
  saved: SavedEntry[] // newest first
  isSaved: (opportunityId: string) => boolean
  toggleSaved: (opportunityId: string) => void
}

const SavedContext = createContext<SavedContextValue | undefined>(undefined)

function loadInitial(): SavedEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (e): e is SavedEntry => !!e && typeof e.id === 'string' && typeof e.savedAt === 'number',
        )
      }
    }
  } catch {
    // storage unavailable or corrupted, fall back to the starter list
  }
  // TODO: start empty once real data comes from the backend
  return [{ id: '4', savedAt: Date.now() - 3 * DAY_MS }]
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedEntry[]>(loadInitial)
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const counter = useRef(0)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // storage unavailable, the list just won't persist
    }
  }, [saved])

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
      const existing = saved.find((e) => e.id === opportunityId)
      const opportunity = OPPORTUNITIES.find((o) => o.id === opportunityId)
      const detail = opportunity ? `${opportunity.title} · ${opportunity.company}` : undefined

      if (existing) {
        // TODO: call studentService.unsaveOpportunity(opportunityId)
        setSaved((prev) => prev.filter((e) => e.id !== opportunityId))
        showToast({
          variant: 'removed',
          message: 'Removed from Saved',
          detail,
          action: {
            label: 'Undo',
            onClick: () => {
              setSaved((prev) =>
                prev.some((e) => e.id === existing.id) ? prev : [...prev, existing].sort((a, b) => b.savedAt - a.savedAt),
              )
              showToast({ variant: 'saved', message: 'Back in your Saved list', detail })
            },
          },
        })
      } else {
        // TODO: call studentService.saveOpportunity(opportunityId)
        setSaved((prev) => [{ id: opportunityId, savedAt: Date.now() }, ...prev])
        showToast({
          variant: 'saved',
          message: 'Saved to your list',
          detail,
          action: { label: 'View Saved', to: '/student/saved' },
        })
      }
    },
    [saved, showToast],
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