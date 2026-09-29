import { useState } from 'react'
import Icon from '../ui/Icon'
import TextField from '../ui/TextField'
import { ACCOUNT_EMAIL } from '../../utils/organizationData'

export default function SecurityCard() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleUpdate() {
    // TODO: call authService.updatePassword({ newPassword }) once the backend exists
    console.log('Updating password')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-brand">
          <Icon name="lock" className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-sm font-bold text-navy">Login & Security</h2>
      </div>

      <div className="mt-5 space-y-4">
        <TextField label="Account Email" value={ACCOUNT_EMAIL} disabled className="bg-slate-100 text-slate-500" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="New Password"
            type="password"
            placeholder="Leave blank to keep current"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleUpdate}
          className="rounded-md border border-slate-200 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-slate-50"
        >
          Update Password
        </button>
      </div>
    </section>
  )
}