import { useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import { ORG_NAV } from '../../utils/organizationData'
import { useAuthContext } from '../../context/AuthContext'

export default function OrgTopbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const { user } = useAuthContext()
  const isNewOpportunity = pathname === '/organization/opportunities/new'
  const isApplicantProfile = /^\/organization\/applicants\/[^/]+$/.test(pathname)
  const isAssessment = /^\/organization\/applicants\/.+\/assessment$/.test(pathname)
  const current = ORG_NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))
  const title = isNewOpportunity
    ? 'Post an Opportunity'
    : isAssessment
      ? 'AI Assessment Evaluation'
      : isApplicantProfile
        ? 'Applicant Profile'
        : current?.title ?? 'Overview'

  return (
    <header className="flex min-h-20 items-center gap-4 border-b border-neutral-200 bg-white px-5 py-4 sm:px-6 lg:px-8">
      <button className="rounded-md p-2 text-navy lg:hidden" aria-label="Open menu" onClick={onMenu}>
        <Icon name="menu" />
      </button>
      <h1 className="font-display text-xl font-bold text-black sm:text-2xl">{title}</h1>

      <div className="ml-auto flex items-center gap-5">
        <div className="flex items-center gap-3 md:border-l md:border-neutral-200 md:pl-5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-white">
            <Icon name="building" className="h-4 w-4" />
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-navy">{user?.organizationName || 'Organization'}</p>
            <p className="text-xs text-slate-500">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>
    </header>
  )
}