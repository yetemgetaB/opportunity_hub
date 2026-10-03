import ReportStatsRow from '../../components/reports/ReportStatsRow'
import ApplicationsBarChart from '../../components/reports/ApplicationsBarChart'
import StatusFunnelCard from '../../components/reports/StatusFunnelCard'
import SkillMatchesCard from '../../components/reports/SkillMatchesCard'
import { MONTHLY_APPLICATIONS, REPORT_STATS, SKILL_MATCHES, STATUS_FUNNEL } from '../../utils/studentData'

export default function ReportsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy">Your Application Report</h2>
          <p className="mt-1 text-sm text-slate-500">A summary of your job search activity and performance.</p>
        </div>
        {/* TODO: wire this up to a real date range selector */}
        <span className="text-xs text-slate-500">
          Range: <span className="font-semibold text-navy">Last 90 days</span>
        </span>
      </div>

      <div className="mt-6">
        <ReportStatsRow stats={REPORT_STATS} />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ApplicationsBarChart data={MONTHLY_APPLICATIONS} />
        <StatusFunnelCard steps={STATUS_FUNNEL} />
      </div>

      <div className="mt-6">
        <SkillMatchesCard skills={SKILL_MATCHES} />
      </div>
    </div>
  )
}