import StatCard from '../../components/ui/StatCard'
import RecommendedCard from '../../components/opportunities/RecommendedCard'
import UpcomingDeadlines from '../../components/applications/UpcomingDeadlines'
import RecentActivity from '../../components/notifications/RecentActivity'
import { Link } from 'react-router-dom'
import { OPPORTUNITIES, RECENT_ACTIVITY, STUDENT_NAME, STUDENT_STATS, UPCOMING_DEADLINES } from '../../utils/studentData'

export default function DashboardPage() {
  const recommended = OPPORTUNITIES.filter((o) => o.recommended)

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-black">Welcome back, {STUDENT_NAME}</h2>
        <p className="mt-1.5 text-base text-gray-500">Here’s what’s happening today.</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STUDENT_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-black">Recommended For You</h2>
          <Link to="/student/opportunities" className="shrink-0 text-sm font-semibold text-brand hover:underline">
            View all matches
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {recommended.map((r) => (
            <RecommendedCard key={r.id} r={r} />
          ))}
        </div>
      </section>

      <div className="mt-8 grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
        <UpcomingDeadlines deadlines={UPCOMING_DEADLINES} />
        <RecentActivity items={RECENT_ACTIVITY} />
      </div>
    </div>
  )
}