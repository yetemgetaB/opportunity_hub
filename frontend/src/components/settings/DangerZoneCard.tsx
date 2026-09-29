import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmPasswordModal from '../ui/ConfirmPasswordModal'

type PendingAction = 'deactivate' | 'delete' | null

export default function DangerZoneCard() {
  const [pending, setPending] = useState<PendingAction>(null)
  const navigate = useNavigate()

  function handleConfirm(password: string) {
    if (pending === 'delete') {
      // TODO: call organizationService.deleteAccount({ password }) once the backend exists
      console.log('Deleting account, password verified:', Boolean(password))
    } else if (pending === 'deactivate') {
      // TODO: call organizationService.deactivate({ password }) once the backend exists
      console.log('Deactivating organization, password verified:', Boolean(password))
    }
    setPending(null)
    navigate('/login')
  }

  return (
    <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-red-600">Danger Zone</h2>
      <p className="mt-1 text-xs text-slate-500">These actions are permanent.</p>

      <button
        onClick={() => setPending('deactivate')}
        className="mt-4 w-full rounded-md border border-red-300 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
      >
        Deactivate Organization
      </button>
      <button
        onClick={() => setPending('delete')}
        className="mt-2 w-full rounded-md bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700"
      >
        Delete Account
      </button>

      {pending === 'deactivate' && (
        <ConfirmPasswordModal
          title="Deactivate your organization?"
          description="Your postings will be hidden from students and paused until you reactivate. Your data is kept."
          confirmLabel="Deactivate"
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}

      {pending === 'delete' && (
        <ConfirmPasswordModal
          title="Delete your account?"
          description="This permanently deletes your organization profile, opportunity postings, and applicant data. This can't be undone."
          confirmLabel="Permanently Delete"
          danger
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </section>
  )
}