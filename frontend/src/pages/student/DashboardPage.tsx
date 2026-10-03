import StatCard from '../../components/ui/StatCard'
import RecommendedCard from '../../components/opportunities/RecommendedCard'
import UpcomingDeadlines from '../../components/applications/UpcomingDeadlines'
import RecentActivity from '../../components/notifications/RecentActivity'
import { Link } from 'react-router-dom'
import { OPPORTUNITIES, RECENT_ACTIVITY, STUDENT_NAME, STUDENT_STATS, UPCOMING_DEADLINES } from '../../utils/studentData'

export default function DashboardPage() {
  const recommended = OPPORTUNITIES.filter((o) => o.recommended)

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy">Welcome back, {STUDENT_NAME}</h2>
      <p className="mt-1 text-sm text-slate-500">Here's whats happening</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STUDENT_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-navy">Recommended For You</h2>
          <Link to="/student/opportunities" className="text-xs font-semibold text-brand hover:underline">
            View all matches
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {recommended.map((r) => (
            <RecommendedCard key={r.id} r={r} />
          ))}
        </div>
      </section>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <UpcomingDeadlines deadlines={UPCOMING_DEADLINES} />
        <RecentActivity items={RECENT_ACTIVITY} />
      </div>
    </div>
  )
}