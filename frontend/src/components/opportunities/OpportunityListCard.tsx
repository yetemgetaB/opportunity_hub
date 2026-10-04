import { Link } from 'react-router-dom'
import BookmarkButton from '../ui/BookmarkButton'
import type { Opportunity } from '../../types/student'

export default function OpportunityListCard({ o }: { o: Opportunity }) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-navy text-base font-bold text-white">
          {o.company[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-black">{o.company}</p>
          <p className="truncate text-xs text-gray-500">{o.location}</p>
        </div>
        <BookmarkButton opportunityId={o.id} />
      </div>

      <h3 className="mt-5 font-display text-base font-bold text-black">{o.title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        {o.description}{' '}
        <Link to={`/student/opportunities/${o.id}`} className="font-medium text-navy underline underline-offset-2">
          view more
        </Link>
      </p>

      <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
        {o.tags.map((tag) => (
          <span key={tag} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-navy">{tag}</span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-brand">{o.type}</span>
        <Link
          to={`/student/opportunities/${o.id}`}
          className="rounded-md bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-light"
        >
          Apply Now
        </Link>
      </div>
    </article>
  )
}
