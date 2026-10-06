/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Footer from '../../components/layout/Footer'
import Navbar from '../../components/layout/Navbar'
import Icon from '../../components/ui/Icon'
import { ApiError } from '../../services/api'
import { getOpportunity } from '../../services/opportunityService'
import { applicationService } from '../../services/applicationService'
import type { PublicOpportunity } from '../../types/opportunity'
import { useAuthContext } from '../../context/AuthContext'
import { useSaved } from '../../context/SavedContext'

function formatDate(value?: string | null) {
  if (!value) return null
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function isExpired(value?: string | null) {
  if (!value) return false
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const deadline = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)
  if (Number.isNaN(deadline.getTime())) return false
  if (dateOnly || !value.includes('T')) deadline.setHours(23, 59, 59, 999)
  return deadline.getTime() < Date.now()
}

function organizationName(opportunity: PublicOpportunity) {
  return typeof opportunity.organization === 'string'
    ? opportunity.organization
    : opportunity.organization?.name
}

function skillNames(opportunity: PublicOpportunity) {
  return opportunity.skills
    ?.map((item) => item.skill?.name ?? item.name)
    .filter((name): name is string => Boolean(name))
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-neutral-200 py-6 first:border-0 first:pt-0">
      <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  )
}

export default function OpportunityDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { isSaved, toggleSaved } = useSaved()
  const [opportunity, setOpportunity] = useState<PublicOpportunity>()
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [applicationCheckError, setApplicationCheckError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setNotFound(true)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setNotFound(false)
    setError(false)

    getOpportunity(id, controller.signal)
      .then(setOpportunity)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setOpportunity(undefined)
        if ((cause instanceof ApiError && cause.status === 404) || (cause instanceof Error && cause.message === 'Opportunity not found.')) setNotFound(true)
        else setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [id, reloadKey])

  useEffect(() => {
    if (user?.role !== 'STUDENT' || !opportunity) {
      setAlreadyApplied(false)
      setApplicationCheckError('')
      return
    }
    let active = true
    applicationService.getMyApplications()
      .then((items) => {
        if (active) setAlreadyApplied(items.some((item) => item.opportunityId === opportunity.id))
      })
      .catch((cause: unknown) => {
        if (active) setApplicationCheckError(cause instanceof Error ? cause.message : 'Unable to verify application status.')
      })
    return () => { active = false }
  }, [opportunity, user?.role])

  const expired = opportunity ? isExpired(opportunity.applicationDeadline) : false
  const skills = opportunity ? skillNames(opportunity) : undefined

  function continueToLogin(action: 'apply' | 'save') {
    navigate('/login', {
      state: { from: { pathname: `/student/opportunities/${id}` }, intent: action },
    })
  }

  async function applyToOpportunity() {
    if (!user) {
      continueToLogin('apply')
      return
    }
    if (user.role !== 'STUDENT' || !opportunity) {
      setActionMessage('Sign in with a student account to apply.')
      return
    }
    try {
      await applicationService.apply(opportunity.id)
      setAlreadyApplied(true)
      setActionMessage('Application submitted. Track it from your student dashboard.')
    } catch (cause) {
      setActionMessage(cause instanceof Error ? cause.message : 'Unable to submit your application.')
    }
  }

  function saveOpportunity() {
    if (!user) {
      continueToLogin('save')
      return
    }
    if (user.role !== 'STUDENT' || !opportunity) {
      setActionMessage('Sign in with a student account to save opportunities.')
      return
    }
    toggleSaved(opportunity.id)
  }

  let content: ReactNode
  if (loading) {
    content = (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" aria-busy="true">
        <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-8">
          <div className="h-5 w-28 rounded bg-slate-100" />
          <div className="mt-6 h-8 w-3/4 rounded bg-slate-100" />
          <div className="mt-4 h-4 w-1/3 rounded bg-slate-100" />
          <div className="mt-10 h-28 rounded bg-slate-100" />
        </div>
        <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-6">
          <div className="h-5 w-2/3 rounded bg-slate-100" />
          <div className="mt-6 h-12 rounded bg-slate-100" />
          <div className="mt-3 h-12 rounded bg-slate-100" />
        </div>
      </div>
    )
  } else if (notFound) {
    content = (
      <div className="rounded-xl border border-neutral-200 bg-white px-6 py-14 text-center">
        <h1 className="font-display text-2xl font-bold text-navy">Opportunity not found</h1>
        <p className="mt-3 text-sm text-slate-600">This opportunity may have been removed or is no longer available.</p>
        <Link to="/opportunities" className="mt-6 inline-flex font-semibold text-amber-700 hover:underline">
          Browse opportunities
        </Link>
      </div>
    )
  } else if (error || !opportunity) {
    content = (
      <div className="rounded-xl border border-red-200 bg-white px-6 py-12 text-center">
        <Icon name="alertTriangle" className="mx-auto size-8 text-red-600" />
        <h1 className="mt-4 font-display text-xl font-bold text-navy">Opportunity details couldn’t be loaded</h1>
        <p className="mt-2 text-sm text-slate-600">The opportunity service is unavailable right now. Please try again.</p>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          className="mt-5 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-950"
        >
          Try again
        </button>
      </div>
    )
  } else {
    const organization = organizationName(opportunity)
    const deadline = formatDate(opportunity.applicationDeadline)
    const yearRange = opportunity.minimumAcademicYear != null
      ? `Year ${opportunity.minimumAcademicYear}${opportunity.maximumAcademicYear != null && opportunity.maximumAcademicYear !== opportunity.minimumAcademicYear ? `–${opportunity.maximumAcademicYear}` : ''}`
      : opportunity.maximumAcademicYear != null
        ? `Up to year ${opportunity.maximumAcademicYear}`
        : null

    content = (
      <>
        <Link to="/opportunities" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy">
          <span aria-hidden="true">←</span> All opportunities
        </Link>
        {expired && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
            <Icon name="info" className="mt-0.5 size-5 shrink-0" />
            <p>This opportunity’s application deadline has passed. Applications are no longer available.</p>
          </div>
        )}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {opportunity.opportunityType && (
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-navy">
                  {opportunity.opportunityType.replace(/_/g, ' ')}
                </span>
              )}
              {opportunity.isRemote && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Remote</span>
              )}
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">
              {opportunity.title}
            </h1>
            {organization && <p className="mt-3 text-base font-medium text-slate-600">{organization}</p>}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-600">
              {opportunity.location && (
                <span className="inline-flex items-center gap-2">
                  <Icon name="building" className="size-4 text-slate-400" />{opportunity.location}
                </span>
              )}
              {deadline && (
                <span className="inline-flex items-center gap-2">
                  <Icon name="calendar" className="size-4 text-slate-400" />Deadline: {deadline}
                </span>
              )}
            </div>

            <div className="mt-8">
              <DetailSection title="About this opportunity">
                {opportunity.description
                  ? <p className="whitespace-pre-line">{opportunity.description}</p>
                  : <p>Additional details have not been provided.</p>}
              </DetailSection>
              {(yearRange || opportunity.minimumGpa != null || (opportunity.eligibleFields?.length ?? 0) > 0) && (
                <DetailSection title="Eligibility">
                  <ul className="space-y-2">
                    {yearRange && <li>Academic year: {yearRange}</li>}
                    {opportunity.minimumGpa != null && <li>Minimum GPA: {opportunity.minimumGpa}</li>}
                    {opportunity.eligibleFields?.length ? <li>Fields of study: {opportunity.eligibleFields.join(', ')}</li> : null}
                  </ul>
                </DetailSection>
              )}
              {skills && skills.length > 0 && (
                <DetailSection title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="rounded-md border border-neutral-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </DetailSection>
              )}
              {opportunity.compensation && (
                <DetailSection title="Compensation">
                  <p>{opportunity.compensation}</p>
                </DetailSection>
              )}
              {organization && (
                <DetailSection title="Organization">
                  <p className="font-semibold text-navy">{organization}</p>
                  {opportunity.organization && typeof opportunity.organization === 'object' && opportunity.organization.description && (
                    <p className="mt-2 whitespace-pre-line">{opportunity.organization.description}</p>
                  )}
                  {opportunity.organization && typeof opportunity.organization === 'object' && opportunity.organization.websiteUrl && (
                    <a
                      href={opportunity.organization.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex font-semibold text-amber-700 hover:underline"
                    >
                      Visit organization website
                    </a>
                  )}
                </DetailSection>
              )}
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="font-display text-lg font-bold text-navy">Ready to apply?</h2>
              {deadline && <p className="mt-2 text-sm text-slate-600">Applications close {deadline}.</p>}
              {opportunity.compensation && <p className="mt-2 text-sm text-slate-600">{opportunity.compensation}</p>}
              {expired ? (
                <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-lg bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500">
                  Applications closed
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyToOpportunity}
                  disabled={alreadyApplied || Boolean(applicationCheckError)}
                  className="mt-5 w-full rounded-lg bg-brand px-4 py-3 text-sm font-bold text-navy transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {alreadyApplied ? 'Already applied' : applicationCheckError ? 'Unable to verify status' : user?.role === 'STUDENT' ? 'Apply now' : 'Sign in to apply'}
                </button>
              )}
              <button
                type="button"
                onClick={saveOpportunity}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-navy transition hover:bg-slate-50"
              >
                <Icon name="bookmark" className="size-4" /> {user?.role === 'STUDENT' && opportunity && isSaved(opportunity.id) ? 'Remove saved opportunity' : 'Save opportunity'}
              </button>
              {actionMessage && <p role="status" className="mt-3 text-xs leading-5 text-slate-600">{actionMessage}</p>}
              {applicationCheckError && <p role="alert" className="mt-3 text-xs leading-5 text-red-600">Application status could not be verified: {applicationCheckError}</p>}
            </section>
            <section className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-navy">Something not right?</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">Reporting is not available because the backend does not expose a report endpoint.</p>
            </section>
          </aside>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[65vh] bg-slate-50 px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <div className="mx-auto max-w-7xl">{content}</div>
      </main>
      <Footer />
    </>
  )
}
