/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import RecommendedCard from '../../components/opportunities/RecommendedCard'
import RecentActivity from '../../components/notifications/RecentActivity'
import type { ActivityItem } from '../../types/student'
import type { ApplicationItem } from '../../types/application'
import type { OpportunityRecommendation } from '../../services/recommendationService'
import { recommendationService } from '../../services/recommendationService'
import { applicationService } from '../../services/applicationService'
import { useAuthContext } from '../../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [recommendations, setRecommendations] = useState<OpportunityRecommendation[]>([])
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.allSettled([
      recommendationService.getRecommendations(),
      applicationService.getMyApplications(),
    ]).then(([recommendationResult, applicationResult]) => {
      if (!active) return
      const errors: string[] = []
      if (recommendationResult.status === 'fulfilled') {
        setRecommendations(recommendationResult.value)
      } else {
        errors.push(recommendationResult.reason instanceof Error
          ? recommendationResult.reason.message
          : 'Unable to load recommendations.')
      }
      if (applicationResult.status === 'fulfilled') {
        const applicationItems = applicationResult.value
        setApplications(applicationItems)
        setActivity(applicationItems.slice(0, 4).map((application): ActivityItem => ({
          id: application.id,
          icon: 'file',
          title: `Applied to ${application.opportunity?.organization && typeof application.opportunity.organization === 'object'
            ? application.opportunity.organization.name ?? 'an organization'
            : application.opportunity?.organization ?? 'an organization'}`,
          time: application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'Date unavailable',
          text: `${application.opportunity?.title ?? 'Opportunity'} application is ${application.status.replaceAll('_', ' ').toLowerCase()}.`,
        })))
      } else {
        errors.push(applicationResult.reason instanceof Error
          ? applicationResult.reason.message
          : 'Unable to load your applications.')
      }
      setError(errors.join(' '))
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Unable to load your dashboard.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [user?.id])

  const stats = [
    { label: 'Applications', value: applications.length, note: 'Applications submitted', icon: 'file' as const },
    { label: 'Recommended Opportunities', value: recommendations.length, note: 'Based on your profile', icon: 'sparkles' as const },
  ]

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-black">Welcome back, {user?.firstName || 'Student'}</h2>
        <p className="mt-1.5 text-base text-gray-500">Recommendations matched to your profile and your applications.</p>
      </div>
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-black">Opportunities to explore</h2>
          <Link to="/student/opportunities" className="shrink-0 text-sm font-semibold text-brand hover:underline">View all</Link>
        </div>
        {loading ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-slate-500">Loading opportunities…</p>
        ) : recommendations.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((recommendation) => (
              <RecommendedCard key={recommendation.opportunity.id} r={recommendation} />
            ))}
          </div>
        ) : !error ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-slate-500">No recommendations are available for your profile right now.</p>
        ) : null}
      </section>

      <div className="mt-8">
        <RecentActivity items={activity} />
      </div>
    </div>
  )
}
