import { Link } from 'react-router-dom'
import type { PublicOpportunity } from '../../types/opportunity'

function formatDeadline(value?: string | null) {
  if (!value) return null
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function getOrganizationName(opportunity: PublicOpportunity) {
  return typeof opportunity.organization === 'string'
    ? opportunity.organization
    : opportunity.organization?.name
}

function getSkillNames(opportunity: PublicOpportunity) {
  return opportunity.skills
    ?.map((item) => item.skill?.name ?? item.name)
    .filter((name): name is string => Boolean(name))
    .slice(0, 4)
}

export default function OpportunityCard({ o }: { o: PublicOpportunity }) {
  const deadline = formatDeadline(o.applicationDeadline)
  const organization = getOrganizationName(o)
  const skills = getSkillNames(o)

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
      {organization && <p className="mt-1 text-sm font-medium text-slate-600">{organization}</p>}
      {o.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{o.description}</p>}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        {o.location && <span>{o.location}</span>}
        {o.minimumAcademicYear != null && (
          <span>
            Year {o.minimumAcademicYear}
            {o.maximumAcademicYear != null && o.maximumAcademicYear !== o.minimumAcademicYear
              ? `–${o.maximumAcademicYear}`
              : ''}
          </span>
        )}
        {deadline && <span>Apply by {deadline}</span>}
      </div>
      {skills && skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="rounded-md border border-neutral-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              {skill}
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
