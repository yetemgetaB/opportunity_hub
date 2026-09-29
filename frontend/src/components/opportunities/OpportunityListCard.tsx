import Button from '../ui/Button'
import BookmarkButton from '../ui/BookmarkButton'
import type { Opportunity } from '../../types/student'

export default function OpportunityListCard({ o }: { o: Opportunity }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy text-sm font-bold text-white">
          {o.company[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy">{o.company}</p>
          <p className="truncate text-xs text-slate-500">{o.location}</p>
        </div>
        <BookmarkButton opportunityId={o.id} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-navy">{o.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
        {o.description}{' '}
        <a href="#" className="font-medium text-brand">view more</a>
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {o.tags.map((t) => (
          <span key={t} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{t}</span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs font-semibold text-brand">{o.type}</span>
        <Button to={`/student/opportunities/${o.id}`} className="px-4 py-2 text-xs">Apply Now</Button>
      </div>
    </article>
  )
}