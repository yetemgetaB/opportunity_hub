import { Link, useNavigate } from 'react-router-dom'
import type { OpportunitySearchResult } from '../../types/opportunity'

export default function OpportunityCard({ o }: { o: OpportunitySearchResult }) {
  const navigate = useNavigate()
  const tags = [...o.skills, ...o.eligibleFields].slice(0, 4)

  return (
    <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {o.opportunityType && (
          <span className="w-fit rounded-full bg-amber-500/10 border border-amber-200/60 px-3 py-1 text-xs font-semibold text-amber-900">
            {o.opportunityType.replace(/_/g, ' ')}
          </span>
        )}
        {o.isRemote && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Remote
          </span>
        )}
      </div>
      <h2 className="mt-4 font-display text-xl font-bold leading-6 text-navy hover:text-amber-800 transition">
        {o.title}
      </h2>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        {o.location && <span>📍 {o.location}</span>}
        {!o.location && o.isRemote && <span>🌐 Remote</span>}
      </div>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <button
              key={`${tag}-${index}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/opportunities?skills=${encodeURIComponent(tag)}`)
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 focus:outline-none"
              title={`Filter by ${tag}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <Link
        to={`/opportunities/${encodeURIComponent(o.id)}`}
        className="mt-auto inline-flex items-center justify-between border-t border-neutral-200 pt-4 text-sm font-semibold text-navy transition hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        aria-label={`View details for ${o.title}`}
      >
        View opportunity details
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}
