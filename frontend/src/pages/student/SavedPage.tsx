import { Link } from 'react-router-dom'
import SavedCard from '../../components/opportunities/SavedCard'
import BookmarkIcon from '../../components/ui/BookmarkIcon'
import { useSaved } from '../../context/SavedContext'
import { OPPORTUNITIES } from '../../utils/studentData'

export default function SavedPage() {
  const { saved } = useSaved()

  const items = saved.flatMap((entry) => {
    const opportunity = OPPORTUNITIES.find((o) => o.id === entry.id)
    return opportunity ? [{ entry, opportunity }] : []
  })

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy">Saved Opportunities</h2>
          <p className="mt-1 text-sm text-slate-500">Opportunities you've bookmarked to revisit later.</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">{items.length} saved</span>
          <span>
            Sort: <span className="font-semibold text-navy">Recently saved</span>
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <BookmarkIcon className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-navy">Nothing saved yet</p>
          <p className="mt-1 text-xs text-slate-500">Tap the bookmark on any opportunity to keep it here.</p>
          <Link to="/student/opportunities" className="mt-4 inline-block text-xs font-semibold text-brand hover:underline">
            Browse opportunities
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {items.map(({ entry, opportunity }) => (
            <SavedCard key={entry.id} o={opportunity} savedAt={entry.savedAt} />
          ))}
        </div>
      )}
    </div>
  )
}