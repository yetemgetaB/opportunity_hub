import StatCard from '../../components/ui/StatCard'
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

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-navy">Welcome back, {ORG_NAME}</h2>
      <p className="mt-1 text-sm text-slate-500">
        Your talent pipeline is healthy. {ASSESSMENTS_TODAY} candidates completed AI assessments today.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {ORG_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <RecentApplicantsTable applicants={RECENT_APPLICANTS} />
        <div className="space-y-6">
          <QuickActions />
          <ActiveOpenings openings={ACTIVE_OPENINGS} total={ACTIVE_OPENINGS_TOTAL} />
        </div>
      </div>
    </div>
  )
}