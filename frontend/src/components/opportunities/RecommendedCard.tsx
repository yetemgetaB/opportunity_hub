import Button from '../ui/Button'
import BookmarkButton from '../ui/BookmarkButton'
import type { Opportunity } from '../../types/student'

export default function RecommendedCard({ r }: { r: Opportunity }) {
  return (
    <article className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-sm font-bold text-white">
          {r.company[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-black">{r.company}</p>
          <p className="truncate text-xs text-gray-500">{r.location}</p>
        </div>
        <span className="rounded-md bg-brand/10 px-2 py-1 text-xs font-bold text-brand">{r.fit}% Fit</span>
        <BookmarkButton opportunityId={r.id} className="ml-1 mt-1" />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-display text-base font-bold text-black">{r.title}</h3>
        <div className="flex flex-wrap gap-1.5">
          {r.tags.map((t) => (
            <span key={t} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-navy">{t}</span>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-brand">{r.type}</span>
        <Button to={`/student/opportunities/${r.id}`} className="px-4 py-2 text-xs">Apply Now</Button>
      </div>
    </article>
  )
}