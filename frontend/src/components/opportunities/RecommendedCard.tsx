import Button from '../ui/Button'
import BookmarkButton from '../ui/BookmarkButton'
import type { OpportunityRecommendation } from '../../services/recommendationService'

export default function RecommendedCard({ r }: { r: OpportunityRecommendation }) {
  const opportunity = r.opportunity
  const company = typeof opportunity.organization === 'string'
    ? opportunity.organization
    : opportunity.organization?.name ?? 'Organization'
  const skills = r.matchedSkills.length
    ? r.matchedSkills
    : (opportunity.skills ?? []).map((skill) => skill.skill?.name ?? skill.name).filter((name): name is string => Boolean(name))

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-sm font-bold text-white">
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
        <h3 className="font-display text-base font-bold text-black">{opportunity.title}</h3>
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((t) => (
            <span key={t} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-navy">{t}</span>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-brand">
          {opportunity.opportunityType ?? 'Opportunity'} · {Math.round(r.score)}% match
        </span>
        <Button to={`/student/opportunities/${opportunity.id}`} className="px-4 py-2 text-xs">View</Button>
      </div>
    </article>
  )
}