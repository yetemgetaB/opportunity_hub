import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmPasswordModal from '../ui/ConfirmPasswordModal'

export default function StudentDangerZoneCard() {
  const [confirming, setConfirming] = useState(false)
  const navigate = useNavigate()

  function handleConfirm(password: string) {
    // TODO: call studentService.deleteAccount({ password }) once the backend exists
    console.log('Deleting student account, password verified:', Boolean(password))
    setConfirming(false)
    navigate('/login')
  }

  return (
    <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-red-600">Danger Zone</h2>
      <p className="mt-1 text-xs text-slate-500">These actions are permanent.</p>

      <button
        onClick={() => setConfirming(true)}
        className="mt-4 w-full rounded-md bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700"
      >
        Delete Account
      </button>

      {confirming && (
        <ConfirmPasswordModal
          title="Delete your account?"
          description="This permanently deletes your profile, applications, and saved opportunities. This can't be undone."
          confirmLabel="Permanently Delete"
          danger
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />
      )}
    </section>
  )
}