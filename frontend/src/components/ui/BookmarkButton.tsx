import { useSaved } from '../../context/SavedContext'
import BookmarkIcon from './BookmarkIcon'

type Props = { opportunityId: string; className?: string }

export default function BookmarkButton({ opportunityId, className = '' }: Props) {
  const { isSaved, toggleSaved } = useSaved()
  const saved = isSaved(opportunityId)

  return (
    <button
      type="button"
      onClick={() => toggleSaved(opportunityId)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save opportunity'}
      className={`transition ${saved ? 'text-brand' : 'text-slate-300 hover:text-navy'} ${className}`}
    >
      <BookmarkIcon filled={saved} className="h-4 w-4" />
    </button>
  )
}