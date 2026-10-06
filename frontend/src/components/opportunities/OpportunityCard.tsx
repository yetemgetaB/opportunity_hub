import { Link } from 'react-router-dom'
import type { OpportunitySearchResult } from '../../types/opportunity'

export default function OpportunityCard({ o }: { o: OpportunitySearchResult }) {
  const tags = [...o.skills, ...o.eligibleFields].slice(0, 4)

  return (
    <article className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-brand/50 hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {o.opportunityType && (
          <span className="w-fit rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-navy">
            {o.opportunityType.replace(/_/g, ' ')}
          </span>
        )}
        {o.isRemote && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Remote
          </span>
        )}
      </div>
      <h2 className="mt-4 font-display text-xl font-bold leading-6 text-navy">{o.title}</h2>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        {o.location && <span>{o.location}</span>}
        {!o.location && o.isRemote && <span>Remote</span>}
      </div>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="rounded-md border border-neutral-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      )}
      <Link
        to={`/opportunities/${encodeURIComponent(o.id)}`}
        className="mt-5 inline-flex items-center justify-between border-t border-neutral-200 pt-4 text-sm font-semibold text-navy transition hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        aria-label={`View details for ${o.title}`}
      >
        View opportunity details
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}
