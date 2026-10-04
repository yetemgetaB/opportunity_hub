import Icon from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import RecentApplicantsTable from '../../components/applicants/RecentApplicantsTable'
import QuickActions from '../../components/opportunities/QuickActions'
import ActiveOpenings from '../../components/opportunities/ActiveOpenings'
import {
  ACTIVE_OPENINGS,
  ACTIVE_OPENINGS_TOTAL,
  ASSESSMENTS_TODAY,
  ORG_NAME,
  ORG_STATS,
  RECENT_APPLICANTS,
} from '../../utils/organizationData'

const DASHBOARD_STATS = ORG_STATS.filter((stat) => stat.label !== 'Recently Accepted')

function DashboardStatCard({ label, value, note, icon }: { label: string; value: number | string; note: string; icon: IconName }) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-800">
          <Icon name={icon} className="size-4" />
        </span>
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-xs font-semibold text-emerald-500">{note}</span>
      </p>
    </article>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-display text-3xl font-bold text-slate-900">Welcome back, {ORG_NAME}</h2>
        <p className="mt-1.5 text-base text-gray-500">
          Your talent pipeline is healthy. {ASSESSMENTS_TODAY} candidates completed AI assessments today.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DASHBOARD_STATS.map((stat) => (
          <DashboardStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <RecentApplicantsTable applicants={RECENT_APPLICANTS} />
        <div className="space-y-6">
          <QuickActions />
          <ActiveOpenings openings={ACTIVE_OPENINGS} total={ACTIVE_OPENINGS_TOTAL} />
        </div>
      </div>
    </div>
  )
}