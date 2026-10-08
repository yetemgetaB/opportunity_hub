import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import RecommendedCard from '../../components/opportunities/RecommendedCard'
import RecentActivity from '../../components/notifications/RecentActivity'
import OnboardingModal from '../../components/student/OnboardingModal'
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
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      const [recommendationResult, applicationResult] = await Promise.allSettled([
        recommendationService.getRecommendations(),
        applicationService.getMyApplications(),
      ])

      const errors: string[] = []
      if (recommendationResult.status === 'fulfilled') {
        setRecommendations(recommendationResult.value)
        setProfileIncomplete(false)
        setShowOnboardingModal(false)
      } else {
        const reason = recommendationResult.reason instanceof Error
          ? recommendationResult.reason.message
          : 'Unable to load recommendations.'
        if (reason.toLowerCase().includes('student profile not found') || reason.toLowerCase().includes('profile not found')) {
          setProfileIncomplete(true)
          setShowOnboardingModal(true)
        } else {
          errors.push(reason)
        }
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
        const reason = applicationResult.reason instanceof Error
          ? applicationResult.reason.message
          : 'Unable to load your applications.'
        if (reason.toLowerCase().includes('student profile not found') || reason.toLowerCase().includes('profile not found')) {
          setProfileIncomplete(true)
          setApplications([])
        } else {
          errors.push(reason)
        }
      }

      setError(errors.join(' '))
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Unable to load your dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData, user?.id])

  function handleOnboardingComplete() {
    setShowOnboardingModal(false)
    setProfileIncomplete(false)
    loadDashboardData()
  }

  const stats = [
    { label: 'Applications', value: applications.length, note: 'Applications submitted', icon: 'file' as const },
    { label: 'Recommended Opportunities', value: recommendations.length, note: profileIncomplete ? 'Set up profile to get matches' : 'Based on your profile', icon: 'sparkles' as const },
  ]

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      {/* Onboarding Modal Pop-up */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onComplete={handleOnboardingComplete}
        studentName={user?.firstName}
      />

      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-black">Welcome back, {user?.firstName || 'Student'}</h2>
        <p className="mt-1.5 text-base text-gray-500">Recommendations matched to your profile and your applications.</p>
      </div>

      {profileIncomplete && (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-amber-950">Complete Your Student Profile</h3>
            <p className="text-sm text-amber-900">
              Add your university, field of study, and career goals to get personalized opportunity recommendations powered by AI.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90"
          >
            Start Setup &rarr;
          </button>
        </div>
      )}

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
        ) : profileIncomplete ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-slate-800">No recommendations yet</p>
            <p className="mt-1 text-xs text-gray-500">Set up your student profile to unlock personalized opportunity recommendations.</p>
            <button
              type="button"
              onClick={() => setShowOnboardingModal(true)}
              className="mt-3 inline-block text-xs font-bold text-brand hover:underline"
            >
              Start setup &rarr;
            </button>
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

