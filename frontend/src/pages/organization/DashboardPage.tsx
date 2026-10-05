import { useEffect, useState } from 'react'
import Icon from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import RecentApplicantsTable from '../../components/applicants/RecentApplicantsTable'
import QuickActions from '../../components/opportunities/QuickActions'
import ActiveOpenings from '../../components/opportunities/ActiveOpenings'
import type { ActiveOpening, RecentApplicant } from '../../types/organization'
import { opportunityService } from '../../services/opportunityService'
import { useAuthContext } from '../../context/AuthContext'

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
  const { user } = useAuthContext()
  const [openings, setOpenings] = useState<ActiveOpening[]>([])
  const [applicants, setApplicants] = useState<RecentApplicant[]>([])
  const [stats, setStats] = useState({ published: 0, applicants: 0, recentApplications: 0, accepted: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'ORGANIZATION') return
    let active = true
    Promise.all([
      opportunityService.getMyOpportunities(user.id),
      Promise.resolve(opportunityService.getApplicants(user.id)),
      Promise.resolve(opportunityService.getStats(user.id)),
    ]).then(([items, records, summary]) => {
      if (!active) return
      const activeItems = items.filter((item) => item.status === 'PUBLISHED')
      setOpenings(activeItems.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        applicants: opportunityService.getApplicants(user.id, item.id).length,
        deadline: item.deadline || 'Not specified',
        urgent: Boolean(item.deadline && new Date(item.deadline).getTime() < Date.now() + 7 * 86400000),
      })))
      setApplicants(records.slice(0, 5).map((item) => ({
        id: item.id,
        name: item.name,
        initials: item.initials,
        position: items.find((opportunity) => opportunity.id === item.opportunityId)?.title ?? 'Applicant',
        match: item.matchScore,
        status: item.status,
      })))
      setStats({
        published: summary.published,
        applicants: summary.applicants,
        recentApplications: summary.recentApplications,
        accepted: records.filter((item) => item.status === 'Accepted').length,
      })
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Unable to load your organization dashboard.')
    })
    return () => { active = false }
  }, [user])

  const dashboardStats = [
    { label: 'Active Opportunities', value: stats.published, note: 'Published postings', icon: 'briefcase' as const },
    { label: 'Total Applicants', value: stats.applicants, note: 'Across your postings', icon: 'users' as const },
    { label: 'Recently Accepted', value: stats.accepted, note: 'Demo applicant records', icon: 'check' as const },
  ]

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-display text-3xl font-bold text-slate-900">Welcome back, {user?.organizationName || 'your organization'}</h2>
        <p className="mt-1.5 text-base text-gray-500">
          You have {stats.recentApplications} recent applications to review.
        </p>
      </header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat) => (
          <DashboardStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <RecentApplicantsTable applicants={applicants} />
        <div className="space-y-6">
          <QuickActions />
          <ActiveOpenings openings={openings} total={stats.published} />
        </div>
      </div>
    </div>
  )
}