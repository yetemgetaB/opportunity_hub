import { Link, useNavigate } from 'react-router-dom'
import BookmarkButton from '../ui/BookmarkButton'
import Icon from '../ui/Icon'
import type { Opportunity } from '../../types/student'

interface Props {
  o: Opportunity
  onApplyClick?: (opportunity: Opportunity) => void
  isApplied?: boolean
}

export default function OpportunityListCard({ o, onApplyClick, isApplied }: Props) {
  const navigate = useNavigate()

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md">
      {/* Top Meta Header */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-navy to-navy-light font-display text-lg font-bold text-white shadow-xs group-hover:scale-105 transition-transform">
              {o.company[0] ?? 'O'}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-display text-sm font-bold text-navy">{o.company}</p>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60">
                  Verified
                </span>
              </div>
              <p className="flex items-center gap-1.5 truncate text-xs text-slate-500 mt-0.5">
                <Icon name="mapPin" className="size-3 text-slate-400 shrink-0" />
                {o.location || 'Remote'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BookmarkButton opportunityId={o.id} className="p-1 rounded-lg hover:bg-slate-50" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <Link
            to={`/student/opportunities/${o.id}`}
            className="group/title inline-block font-display text-lg font-bold text-navy hover:text-amber-800 transition leading-snug"
          >
            {o.title}
          </Link>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {o.description}
          </p>
        </div>

        {/* Dynamic Skill & Tag Pills */}
        {o.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {o.tags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/student/opportunities?search=${encodeURIComponent(tag)}`)
                }}
                className="inline-flex items-center rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 focus:outline-none"
                title={`Filter by ${tag}`}
              >
                {tag}
              </button>
            ))}
            {o.tags.length > 5 && (
              <span className="inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold text-slate-400">
                +{o.tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Bar */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500/10 border border-amber-300/40 px-3 py-1 text-xs font-bold text-amber-900 uppercase tracking-wide">
            {o.type.replace(/_/g, ' ')}
          </span>
          {o.deadline && (
            <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
              Deadline: {new Date(o.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/student/opportunities/${o.id}`}
            className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
          >
            Details
          </Link>

          {isApplied ? (
            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 border border-emerald-200">
              <Icon name="check" className="size-3.5 stroke-[2.5]" />
              Applied
            </span>
          ) : onApplyClick ? (
            <button
              type="button"
              onClick={() => onApplyClick(o)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-navy-light transition active:scale-[0.98]"
            >
              Apply Now →
            </button>
          ) : (
            <Link
              to={`/student/opportunities/${o.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-navy-light transition"
            >
              Apply Now →
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
