/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import Icon from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import RecentApplicantsTable from '../../components/applicants/RecentApplicantsTable'
import QuickActions from '../../components/opportunities/QuickActions'
import ActiveOpenings from '../../components/opportunities/ActiveOpenings'
import type { ActiveOpening, RecentApplicant } from '../../types/organization'
import { applicationService } from '../../services/applicationService'
import { useAuthContext } from '../../context/AuthContext'

function DashboardStatCard({ label, value, note, icon }: { label: string; value: number; note: string; icon: IconName }) {
  return (
    <article className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-800"><Icon name={icon} className="size-4" /></span>
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-xs font-semibold text-slate-500">{note}</span>
      </p>
    </article>
  )
}

export default function DashboardPage() {
  const { user } = useAuthContext()
  const [openings, setOpenings] = useState<ActiveOpening[]>([])
  const [applicants, setApplicants] = useState<RecentApplicant[]>([])
  const [stats, setStats] = useState({ published: 0, applicants: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'ORGANIZATION') {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    applicationService.getOrganizationSummary()
      .then((data) => {
        if (!active) return
        setOpenings(data.openings)
        setApplicants(data.recentApplicants)
        setStats({
          published: data.stats.publishedCount,
          applicants: data.stats.totalApplicants,
        })
        setError('')
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load your organization dashboard.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user?.id, user?.role])

  const dashboardStats = [
    { label: 'Published Opportunities', value: stats.published, note: 'Currently live', icon: 'briefcase' as const },
    { label: 'Total Applicants', value: stats.applicants, note: 'Across your opportunities', icon: 'users' as const },
  ]

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-display text-3xl font-bold text-slate-900">Welcome back, {user?.organizationName || 'your organization'}</h2>
        <p className="mt-1.5 text-base text-gray-500">Overview of your published opportunities and received applications.</p>
      </header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {dashboardStats.map((stat) => <DashboardStatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {loading ? <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-slate-500">Loading applicants…</p> : <RecentApplicantsTable applicants={applicants} />}
        </div>
        <div className="space-y-6">
          <QuickActions />
          <ActiveOpenings openings={openings} total={stats.published} />
        </div>
      </div>
    </div>
  )
}
