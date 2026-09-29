import Button from '../ui/Button'
import BookmarkButton from '../ui/BookmarkButton'
import { timeAgo } from '../../utils/timeAgo'
import type { Opportunity } from '../../types/student'

export default function SavedCard({ o, savedAt }: { o: Opportunity; savedAt: number }) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-sm font-bold text-white">
          {o.company[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy">{o.company}</p>
          <p className="truncate text-xs text-slate-500">{o.location}</p>
        </div>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">{o.fit}% Fit</span>
        <BookmarkButton opportunityId={o.id} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-navy">{o.title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {o.tags.map((t) => (
          <span key={t} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{t}</span>
        ))}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-brand">{o.type}</p>
          <p className="mt-1 text-xs text-slate-400">
            Saved {timeAgo(savedAt)} · Closes {o.deadline}
          </p>
        </div>
        <Button to={`/student/opportunities/${o.id}`} className="shrink-0 px-4 py-2 text-xs">Apply Now</Button>
      </div>
    </article>
  )
}