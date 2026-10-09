/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SavedCard from '../../components/opportunities/SavedCard'
import BookmarkIcon from '../../components/ui/BookmarkIcon'
import { useSaved } from '../../context/SavedContext'
import { opportunityService } from '../../services/opportunityService'
import { toStudentOpportunity } from '../../utils/opportunityPresentation'
import type { Opportunity } from '../../types/student'

export default function SavedPage() {
  const { saved } = useSaved()
  const [items, setItems] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!saved.length) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all(saved.map((id) => opportunityService.getOpportunity(id)))
      .then((opportunities) => {
        if (active) {
          setItems(opportunities.map(toStudentOpportunity))
          setError('')
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load saved opportunities.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [saved])

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-black">Saved Opportunities</h2>
          <p className="mt-1 text-sm text-slate-500">Opportunities you have bookmarked and saved after login.</p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{items.length} saved</span>
      </div>

      {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading saved opportunities…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <BookmarkIcon className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-navy">No saved opportunities to show</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your saved items are restored from the backend after login and refresh.
          </p>
          <Link to="/student/opportunities" className="mt-4 inline-block text-xs font-semibold text-brand hover:underline">
            Browse opportunities
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {items.map((opportunity) => <SavedCard key={opportunity.id} o={opportunity} />)}
        </div>
      )}
    </div>
  )
}
