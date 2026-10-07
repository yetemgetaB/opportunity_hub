/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import Toast, { type ToastState } from '../components/ui/Toast'
import { applicationService } from '../services/applicationService'
import { ApiError } from '../services/api'

const TOAST_MS = 3500

interface SavedContextValue {
  saved: string[]
  isSaved: (opportunityId: string) => boolean
  toggleSaved: (opportunityId: string) => void
}

const SavedContext = createContext<SavedContextValue | undefined>(undefined)

export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([])
  const [toast, setToast] = useState<ToastState | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const counter = useRef(0)

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

  const isSaved = useCallback((opportunityId: string) => saved.includes(opportunityId), [saved])

  const toggleSaved = useCallback((opportunityId: string) => {
    const wasSaved = saved.includes(opportunityId)
    const request = wasSaved
      ? applicationService.unsaveOpportunity(opportunityId)
      : applicationService.saveOpportunity(opportunityId)

    void request.then(() => {
      setSaved((current) => wasSaved
        ? current.filter((id) => id !== opportunityId)
        : current.includes(opportunityId) ? current : [...current, opportunityId])
      showToast({
        variant: wasSaved ? 'removed' : 'saved',
        message: wasSaved ? 'Removed from saved opportunities.' : 'Opportunity saved.',
        action: wasSaved ? undefined : { label: 'View Saved', to: '/student/saved' },
      })
    }).catch((cause: unknown) => {
      const message = cause instanceof ApiError && cause.status === 409 && !wasSaved
        ? 'This opportunity is already saved, but the backend does not provide a saved-list endpoint to retrieve it.'
        : cause instanceof Error
          ? cause.message
          : 'Unable to update saved opportunities.'
      showToast({ variant: 'removed', message })
    })
  }, [saved, showToast])

  const value = useMemo(() => ({ saved, isSaved, toggleSaved }), [saved, isSaved, toggleSaved])

  return (
    <SavedContext.Provider value={value}>
      {children}
      <Toast toast={toast} onClose={closeToast} />
    </SavedContext.Provider>
  )
}

export function useSaved() {
  const context = useContext(SavedContext)
  if (!context) throw new Error('useSaved must be used within a SavedProvider')
  return context
}
