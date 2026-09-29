import { useState } from 'react'
import Icon from './Icon'

type Props = {
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  onConfirm: (password: string) => void
  onCancel: () => void
}

export default function ConfirmPasswordModal({ title, description, confirmLabel, danger, onConfirm, onCancel }: Props) {
  const [password, setPassword] = useState('')
  const canConfirm = password.trim().length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-100 text-red-600">
              <Icon name="alertTriangle" className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-navy">{title}</h2>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{description}</p>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[9px] text-white">✓</span>
            Step 1: Confirmed
            <span className="mx-1 w-3 border-t border-slate-200" />
            <span className="grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] text-white">2</span>
            <span className="text-red-500">Step 2: Verify Password</span>
          </div>

          <label className="mt-4 block text-xs font-semibold text-navy" htmlFor="confirm-password">
            Enter your account password to confirm
          </label>
          <input
            id="confirm-password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className="mt-1.5 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
          <p className="mt-2 text-xs text-slate-400">
            {/* TODO: verify this against the real account password via authService */}
            For your security, we require your password before continuing.
          </p>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-slate-200 py-2.5 text-xs font-semibold text-navy hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => onConfirm(password)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs font-semibold text-white transition ${
              canConfirm ? 'bg-red-600 hover:bg-red-700' : 'cursor-not-allowed bg-red-300'
            } ${danger ? '' : ''}`}
          >
            <Icon name="trash" className="h-3.5 w-3.5" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}