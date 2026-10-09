import { useState, type FormEvent } from 'react'
import TextField from '../ui/TextField'
import { updatePassword } from '../../services/authService'

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const response = await updatePassword(newPassword)
      setSuccess(response.message)
      setNewPassword('')
      setConfirmPassword('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Password could not be updated. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-navy">Change password</h2>
      </div>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="New Password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {error && <p role="alert" className="text-xs font-medium text-red-600">{error}</p>}
        {success && <p role="status" className="text-xs font-medium text-emerald-600">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg border border-neutral-200 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-slate-50 disabled:opacity-50"
        >
          {submitting ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </section>
  )
}
