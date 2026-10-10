import { Link, useNavigate } from 'react-router-dom'
import BookmarkButton from '../ui/BookmarkButton'
import Icon from '../ui/Icon'
import type { OpportunitySearchResult } from '../../types/opportunity'

export default function OpportunityCard({ o }: { o: OpportunitySearchResult }) {
  const navigate = useNavigate()
  const tags = [...o.skills, ...o.eligibleFields].slice(0, 5)

  return (
    <article className="group relative flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-amber-400 hover:shadow-lg">
      <div>
        {/* Header Tags & Bookmark */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {o.opportunityType && (
              <span className="rounded-full bg-amber-500/10 border border-amber-300/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
                {o.opportunityType.replace(/_/g, ' ')}
              </span>
            )}
            {o.isRemote && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Remote
              </span>
            )}
          </div>
          <BookmarkButton opportunityId={o.id} />
        </div>

        {/* Title */}
        <h2 className="mt-4 font-display text-xl font-bold leading-snug text-navy group-hover:text-amber-800 transition">
          <Link to={`/opportunities/${encodeURIComponent(o.id)}`} className="focus:outline-none">
            {o.title}
          </Link>
        </h2>

        {/* Location & Meta */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
          {o.location && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="mapPin" className="size-3.5 text-slate-400" />
              {o.location}
            </span>
          )}
          {!o.location && o.isRemote && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="globe" className="size-3.5 text-slate-400" />
              Worldwide / Remote
            </span>
          )}
        </div>

        {/* Skill Pills */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag, index) => (
              <button
                key={`${tag}-${index}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/opportunities?skills=${encodeURIComponent(tag)}`)
                }}
                className="inline-flex items-center rounded-lg border border-slate-200/80 bg-slate-50/90 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 focus:outline-none"
                title={`Filter by ${tag}`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-700 transition">
          Verified Opportunity
        </span>
        <Link
          to={`/opportunities/${encodeURIComponent(o.id)}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-xs group-hover:bg-navy-light group-hover:shadow transition active:scale-[0.98]"
          aria-label={`View details for ${o.title}`}
        >
          View Details
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
