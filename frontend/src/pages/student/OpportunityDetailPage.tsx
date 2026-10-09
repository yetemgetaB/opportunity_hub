/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import BookmarkIcon from '../../components/ui/BookmarkIcon'
import ApplyModal from '../../components/opportunities/ApplyModal'
import { useSaved } from '../../context/SavedContext'
import type { Opportunity } from '../../types/student'
import { opportunityService } from '../../services/opportunityService'
import { applicationService } from '../../services/applicationService'
import { toStudentOpportunity } from '../../utils/opportunityPresentation'
import { useAuthContext } from '../../context/AuthContext'

export default function OpportunityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { isSaved, toggleSaved } = useSaved()
  const [shareMessage, setShareMessage] = useState('')
  const [applyMessage, setApplyMessage] = useState('')
  const [o, setOpportunity] = useState<Opportunity>()
  const [loading, setLoading] = useState(true)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [applicationCheckError, setApplicationCheckError] = useState('')
  const [showApplyModal, setShowApplyModal] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    opportunityService.getOpportunity(id)
      .then((item) => { if (active) setOpportunity(toStudentOpportunity(item)) })
      .catch((cause: unknown) => {
        if (active) {
          setOpportunity(undefined)
          setApplyMessage(cause instanceof Error ? cause.message : 'Unable to load this opportunity.')
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    if (user?.role !== 'STUDENT' || !id) {
      setAlreadyApplied(false)
      setApplicationCheckError('')
      return
    }
    let active = true
    applicationService.getMyApplications()
      .then((items) => {
        if (active) setAlreadyApplied(items.some((item) => item.opportunityId === id))
      })
      .catch((cause: unknown) => {
        if (active) setApplicationCheckError(cause instanceof Error ? cause.message : 'Unable to verify application status.')
      })
    return () => { active = false }
  }, [id, user?.role])

  if (loading) {
    return <div className="h-80 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-label="Loading opportunity" />
  }

  if (!o) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <p role="alert" className="text-sm text-gray-500">{applyMessage || "We couldn't find that opportunity."}</p>
        <Link to="/student/opportunities" className="mt-3 inline-block text-sm font-semibold text-brand">
          Back to Browse Opportunities
        </Link>
      </div>
    )
  }

  const opportunity = o
  const saved = isSaved(o.id)
  const deadlineDate = o.deadline ? new Date(o.deadline) : undefined
  if (deadlineDate && !Number.isNaN(deadlineDate.getTime())) deadlineDate.setHours(23, 59, 59, 999)
  const expired = Boolean(deadlineDate && !Number.isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < new Date().getTime())

  async function shareOpportunity() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: opportunity.title, text: `${opportunity.title} at ${opportunity.company}`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareMessage('Link copied to clipboard.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareMessage('Unable to share this opportunity from your browser.')
    }
  }

  function handleApplyClick() {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/student/opportunities/${opportunity.id}` }, intent: 'apply' } })
      return
    }
    if (user.role !== 'STUDENT') {
      setApplyMessage('Sign in with a student account to apply.')
      return
    }
    setShowApplyModal(true)
  }

  function handleApplicationSuccess() {
    setAlreadyApplied(true)
    setApplyMessage('Application submitted successfully! Track its status under My Applications.')
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      <section className="opportunity-detail-hero relative flex h-44 items-end overflow-hidden rounded-2xl bg-navy/80 p-6 sm:h-48 sm:p-8">
        <div
          className="opportunity-detail-hero-glow pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0, transparent 45%)' }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-4 sm:gap-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white font-display text-2xl font-bold text-navy sm:size-16 sm:text-3xl">
            {o.company[0]}
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl font-bold text-white sm:text-2xl">{o.company}</p>
            <p className="mt-1 text-sm text-white/50">{o.tagline}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-black sm:text-2xl">{o.title}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500">{o.location}</span>
            <span className="size-1 rounded-full bg-gray-500" aria-hidden="true" />
            <span className="font-semibold text-brand">{o.type}</span>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-gray-500">Application Deadline</p>
          <p className="mt-1 text-sm font-bold text-black">
            {o.deadline ? new Date(o.deadline).toLocaleDateString() : 'Not specified'}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <article className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 sm:p-8">
          <section>
            <h3 className="font-display text-lg font-bold text-black">Role Overview</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">{o.overview}</p>
          </section>

          {o.requirements.length > 0 && <section>
            <h3 className="font-display text-lg font-bold text-black">Key Requirements</h3>
            <ul className="mt-3 space-y-2.5">
              {o.requirements.map((requirement) => (
                <li key={requirement} className="flex gap-3 text-sm leading-5 text-gray-500">
                  <span className="shrink-0 text-brand" aria-hidden="true">•</span>
                  {requirement}
                </li>
              ))}
            </ul>
          </section>}

        </article>

        <aside className="space-y-5">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <Button
              type="button"
              onClick={handleApplyClick}
              disabled={expired || alreadyApplied || Boolean(applicationCheckError)}
              className="w-full rounded-lg py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {expired ? 'Application closed' : alreadyApplied ? 'Already Applied' : 'Apply Now'}
            </Button>
            {expired && <p className="mt-2 text-center text-xs text-red-600">The application deadline has passed.</p>}
            {applicationCheckError && <p className="mt-2 text-center text-xs text-red-600">Application status could not be verified. Reload this page before applying.</p>}
            {applyMessage && <p role="status" className="mt-3 text-center text-xs text-slate-600">{applyMessage}</p>}
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => toggleSaved(o.id)}
                aria-pressed={saved}
                className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                  saved ? 'border-brand bg-amber-50 text-amber-700' : 'border-neutral-200 text-navy hover:bg-slate-50'
                }`}
              >
                <BookmarkIcon filled={saved} className="size-4" /> {saved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={shareOpportunity}
                className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-3 text-sm font-semibold text-navy hover:bg-slate-50"
              >
                <Icon name="share" className="size-4" /> Share
              </button>
            </div>
            {shareMessage && <p role="status" className="mt-3 text-center text-xs text-gray-500">{shareMessage}</p>}
          </section>

          {applicationCheckError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              Could not verify whether you have already applied: {applicationCheckError}
            </p>
          )}
        </aside>
      </div>

      {/* Interactive Application Modal */}
      <ApplyModal
        isOpen={showApplyModal}
        opportunity={opportunity}
        onClose={() => setShowApplyModal(false)}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  )
}
