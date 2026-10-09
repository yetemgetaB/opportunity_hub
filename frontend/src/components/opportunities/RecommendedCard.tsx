import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import BookmarkButton from '../ui/BookmarkButton'
import type { OpportunityRecommendation } from '../../services/recommendationService'

export default function RecommendedCard({ r }: { r: OpportunityRecommendation }) {
  const navigate = useNavigate()
  const opportunity = r.opportunity
  const company = typeof opportunity.organization === 'string'
    ? opportunity.organization
    : opportunity.organization?.name ?? 'Organization'
  const skills = r.matchedSkills.length
    ? r.matchedSkills
    : (opportunity.skills ?? []).map((skill) => skill.skill?.name ?? skill.name).filter((name): name is string => Boolean(name))

  const matchPercent = Math.round(r.score <= 1 ? r.score * 100 : r.score)

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-sm font-bold text-white shadow-sm">
          {company[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-black">{company}</p>
          <p className="truncate text-xs text-gray-500">
            {opportunity.location ?? (opportunity.isRemote ? 'Remote' : 'Location not specified')}
          </p>
        </div>
        <BookmarkButton opportunityId={opportunity.id} className="ml-1 mt-1" />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-display text-base font-bold text-black hover:text-amber-800 transition">
          {opportunity.title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((t) => (
            <button
              key={t}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/student/opportunities?skills=${encodeURIComponent(t)}`)
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 focus:outline-none"
              title={`Filter opportunities by ${t}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{matchPercent}% match</span>
        </div>
        <Button to={`/student/opportunities/${opportunity.id}`} className="px-4 py-2 text-xs font-semibold">
          View
        </Button>
      </div>
    </article>
  )
}