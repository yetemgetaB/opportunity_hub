import { useEffect, useState } from 'react'
import StatCard from '../../components/ui/StatCard'
import RecommendedCard from '../../components/opportunities/RecommendedCard'
import UpcomingDeadlines from '../../components/applications/UpcomingDeadlines'
import RecentActivity from '../../components/notifications/RecentActivity'
import { Link } from 'react-router-dom'
import { STUDENT_NAME } from '../../utils/studentData'
import type { ActivityItem, Deadline, Opportunity } from '../../types/student'
import { opportunityService } from '../../services/opportunityService'
import { useAuthContext } from '../../context/AuthContext'
import type { ApplicationItem } from '../../types/application'

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [items, applied] = await Promise.all([
          opportunityService.getOpportunities({ sort: 'match' }),
          Promise.resolve(opportunityService.getApplications(user?.id)),
        ])
        if (active) {
          const saved = user?.role === 'STUDENT' ? opportunityService.getSavedOpportunities(user.id) : []
          const savedOpportunityIds = saved.map(({ entry }) => entry.id)
          setOpportunities(items)
          setApplications(applied)
          setSavedIds(savedOpportunityIds)
          setDeadlines(items
            .filter((item) => item.deadline && !Number.isNaN(new Date(item.deadline).getTime()))
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .slice(0, 4)
            .map((item): Deadline => ({
              id: item.id,
              title: item.title,
              company: item.company,
              location: item.location,
              type: item.type,
              due: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(item.deadline)),
              status: applied.some((application) => application.opportunityId === item.id) ? 'in progress' : 'saved',
              urgent: new Date(item.deadline).getTime() - Date.now() < 7 * 86400000,
            })))
          setActivity(applied.slice(0, 4).map((application): ActivityItem => ({
            id: application.id,
            icon: 'file',
            title: `Applied to ${application.company}`,
            time: application.appliedDate,
            text: `${application.title} application is ${application.status.replaceAll('_', ' ').toLowerCase()}.`,
          })))
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load your dashboard.')
      }
    }
    void load()
    return () => { active = false }
  }, [user])

  const recommended = opportunities.filter((opportunity) => opportunity.recommended).slice(0, 3)
  const stats = [
    { label: 'Average Match Score', value: opportunities.length ? `${Math.round(opportunities.reduce((sum, opportunity) => sum + opportunity.fit, 0) / opportunities.length)}%` : '—', note: 'Across open opportunities', icon: 'gauge' as const },
    { label: 'Applications', value: applications.length, note: 'Submitted', icon: 'file' as const },
    { label: 'Saved Opportunities', value: savedIds.length, note: 'Bookmarked', icon: 'bookmark' as const },
    { label: 'Available Matches', value: opportunities.length, note: 'Open now', icon: 'sparkles' as const },
  ]

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-black">Welcome back, {user?.firstName || STUDENT_NAME}</h2>
        <p className="mt-1.5 text-base text-gray-500">Here’s what’s happening today.</p>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-black">Recommended For You</h2>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <Link to="/student/assessment/demo-assessment" className="shrink-0 text-sm font-semibold text-slate-600 hover:underline">Try demo assessment</Link>
            <Link to="/student/opportunities" className="shrink-0 text-sm font-semibold text-brand hover:underline">View all matches</Link>
          </div>
        </div>
        {recommended.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {recommended.map((opportunity) => <RecommendedCard key={opportunity.id} r={opportunity} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-slate-500">No recommended opportunities right now.</div>
        )}
      </section>

      <div className="mt-8 grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
        <UpcomingDeadlines deadlines={deadlines} />
        <RecentActivity items={activity} />
      </div>
    </div>
  )
}
