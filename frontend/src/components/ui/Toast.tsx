import { Link } from 'react-router-dom'
import Icon from './Icon'
import BookmarkIcon from './BookmarkIcon'

export type ToastAction = { label: string; to?: string; onClick?: () => void }

export type ToastState = {
  id: number
  message: string
  detail?: string
  variant: 'saved' | 'removed'
  action?: ToastAction
}

type Props = { toast: ToastState | null; onClose: () => void }

export default function Toast({ toast, onClose }: Props) {
  if (!toast) return null

  const actionClass = 'shrink-0 text-xs font-bold text-brand hover:underline'

  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-white/10 bg-navy px-4 py-3 text-white shadow-2xl sm:left-auto sm:max-w-sm"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand/20 text-brand">
        <BookmarkIcon filled={toast.variant === 'saved'} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.message}</p>
        {toast.detail && <p className="truncate text-xs text-slate-300">{toast.detail}</p>}
      </div>
      {toast.action &&
        (toast.action.to ? (
          <Link to={toast.action.to} onClick={onClose} className={actionClass}>
            {toast.action.label}
          </Link>
        ) : (
          <button type="button" onClick={toast.action.onClick} className={actionClass}>
            {toast.action.label}
          </button>
        ))}
      <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 text-slate-400 hover:text-white">
        <Icon name="x" className="h-4 w-4" />
      </button>
    </div>
  )
}
