import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import { STUDENT_ACCOUNT_EMAIL } from '../../utils/studentData'

export default function StudentSessionCard() {
  const navigate = useNavigate()

  function handleLogout() {
    // TODO: clear real auth/session state here once auth exists (e.g. AuthContext.logout())
    navigate('/login')
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-navy">Session</h2>
      <p className="mt-1 text-xs text-slate-500">Signed in as {STUDENT_ACCOUNT_EMAIL}</p>
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