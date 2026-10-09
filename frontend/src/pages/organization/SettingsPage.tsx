import { Link, useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import ChangePasswordForm from '../../components/settings/ChangePasswordForm'
import { useAuthContext } from '../../context/AuthContext'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-navy">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the account options supported by the current backend.</p>
      </header>
      <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold text-navy">Signed-in account</h2>
        <p className="mt-2 text-sm text-slate-600">{user?.email}</p>
        <Link to="/organization/profile" className="mt-4 inline-flex text-sm font-semibold text-brand hover:underline">Edit organization profile</Link>
      </section>
      <ChangePasswordForm />
      <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy-light">
        <Icon name="logout" className="size-4" /> Sign out
      </button>
    </div>
  )
}
