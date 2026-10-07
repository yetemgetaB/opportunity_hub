import { useNavigate } from 'react-router-dom'
import { useSaved } from '../../context/SavedContext'
import BookmarkIcon from './BookmarkIcon'
import { useAuthContext } from '../../context/AuthContext'

type Props = { opportunityId: string; className?: string }

export default function BookmarkButton({ opportunityId, className = '' }: Props) {
  const { isSaved, toggleSaved } = useSaved()
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const saved = isSaved(opportunityId)

  return (
    <button
      type="button"
      onClick={() => {
        if (!user) {
          navigate('/login', { state: { from: { pathname: `/opportunities/${opportunityId}` }, intent: 'save' } })
        } else if (user.role === 'STUDENT') {
          toggleSaved(opportunityId)
        }
      }}
      disabled={Boolean(user && user.role !== 'STUDENT')}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
      title={user && user.role !== 'STUDENT' ? 'Student account required' : undefined}
      className={`transition disabled:cursor-not-allowed disabled:opacity-40 ${saved ? 'text-brand' : 'text-slate-300 hover:text-navy'} ${className}`}
    >
      <BookmarkIcon filled={saved} className="h-4 w-4" />
    </button>
  )
}