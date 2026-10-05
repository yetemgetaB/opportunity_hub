import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import { ACCOUNT_EMAIL } from '../../utils/organizationData'
import { useAuthContext } from '../../context/AuthContext'

export default function SessionCard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-navy">Session</h2>
      <p className="mt-1 text-xs text-slate-500">Signed in as {user?.email ?? ACCOUNT_EMAIL}</p>
      <button
        onClick={handleLogout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-navy py-2.5 text-xs font-semibold text-white hover:bg-navy-light"
      >
        <Icon name="logout" className="h-4 w-4" />
        Log Out
      </button>
    </section>
  )
}