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
    return (
      <div className="mx-auto w-full max-w-[1440px] space-y-6">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-60 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    )
  }

  if (!o) {
    return (
      <div className="mx-auto w-full max-w-[1440px] rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <Icon name="search" className="mx-auto size-12 text-slate-300 mb-3" />
        <h2 className="font-display text-xl font-bold text-navy">Opportunity Not Found</h2>
        <p role="alert" className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          {applyMessage || "We couldn't find the opportunity you're looking for. It may have expired or been removed."}
        </p>
        <Link
          to="/student/opportunities"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-navy-light transition"
        >
          ← Back to Browse Opportunities
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
        setShareMessage('Link copied to clipboard!')
        setTimeout(() => setShareMessage(''), 3000)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareMessage('Unable to share link from your browser.')
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
    setApplyMessage('Application submitted successfully! Track its progress in your applications dashboard.')
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-navy shadow-xs hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 transition active:scale-[0.98]"
        >
          <span className="text-amber-600 transition group-hover:-translate-x-0.5">←</span>
          Back to Opportunities
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={shareOpportunity}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition"
          >
            <Icon name="share" className="size-3.5 text-slate-500" />
            Share
          </button>
          <button
            type="button"
            onClick={() => toggleSaved(o.id)}
            aria-pressed={saved}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold shadow-xs transition ${
              saved
                ? 'border-amber-400 bg-amber-50 text-amber-800'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <BookmarkIcon filled={saved} className="size-3.5" />
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {shareMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 animate-fadeIn">
          {shareMessage}
        </div>
      )}

      {/* Futuristic Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy via-navy to-navy-light p-6 sm:p-10 text-white shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: 'radial-gradient(circle at 85% 15%, #f5a623 0, transparent 45%)' }}
          aria-hidden="true"
        />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <span className="grid size-18 sm:size-20 shrink-0 place-items-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md font-display text-3xl sm:text-4xl font-black text-amber-400 shadow-md">
              {o.company[0] ?? 'O'}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                  {o.type.replace(/_/g, ' ')}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-400/15 border border-emerald-300/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  Verified Partner
                </span>
              </div>
              <h1 className="mt-2.5 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {o.title}
              </h1>
              <p className="mt-1 font-medium text-slate-300 text-sm sm:text-base">
                {o.company}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-white/15 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Application Deadline</p>
            <p className="text-sm sm:text-base font-bold text-amber-400">
              {o.deadline ? new Date(o.deadline).toLocaleDateString() : 'Rolling Admission'}
            </p>
            {expired && (
              <span className="rounded-full bg-red-500/20 border border-red-400/40 px-2.5 py-0.5 text-[11px] font-bold text-red-300">
                Deadline Passed
              </span>
            )}
          </div>
        </div>

        {/* Quick Meta Pills */}
        <div className="relative mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-5 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-medium text-slate-200 backdrop-blur-xs">
            <Icon name="mapPin" className="size-3.5 text-amber-400" />
            {o.location || 'Remote'}
          </span>
          {o.fieldsOfStudy && o.fieldsOfStudy.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 font-medium text-slate-200 backdrop-blur-xs">
              <Icon name="briefcase" className="size-3.5 text-amber-400" />
              {o.fieldsOfStudy.join(', ')}
            </span>
          )}
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column: Role Details */}
        <article className="space-y-6 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <section>
            <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500" />
              Role Overview & Summary
            </h2>
            <div className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base whitespace-pre-line">
              {o.overview || o.description}
            </div>
          </section>

          {/* Key Skills & Requirements */}
          {o.tags.length > 0 && (
            <section className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                    Required & Target Skills
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Click any skill to filter matching opportunities across the platform.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {o.tags.length} tagged
                </span>
              </div>
              <div className="mt-3.5 flex flex-wrap gap-2">
                {o.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => navigate(`/student/opportunities?search=${encodeURIComponent(tag)}`)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 focus:outline-none active:scale-[0.98]"
                    title={`Browse ${tag} opportunities`}
                  >
                    <span>{tag}</span>
                    <span className="text-[10px] text-slate-400">↗</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {o.requirements.length > 0 && o.requirements !== o.tags && (
            <section className="border-t border-slate-100 pt-6">
              <h2 className="font-display text-lg font-bold text-navy flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500" />
                Key Requirements
              </h2>
              <ul className="mt-4 space-y-2.5">
                {o.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="text-amber-500 font-bold shrink-0">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        {/* Right Sticky Sidebar: Call to Action Card */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <h2 className="font-display text-lg font-bold text-navy">Ready to Apply?</h2>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Submit your verified student profile, competencies, and attached CV directly to <span className="font-semibold text-navy">{o.company}</span>.
            </p>

            <div className="mt-6 space-y-3">
              {alreadyApplied ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <div className="inline-flex items-center gap-1.5 font-bold text-emerald-800 text-sm">
                    <Icon name="check" className="size-4 stroke-[2.5]" />
                    Already Applied
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">You have submitted your application for this position.</p>
                  <Link
                    to="/student/applications"
                    className="mt-3 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-xs"
                  >
                    Track Status in Applications →
                  </Link>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleApplyClick}
                  disabled={expired || Boolean(applicationCheckError)}
                  className="w-full rounded-xl py-3.5 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {expired ? 'Application Closed' : 'Apply Now →'}
                </Button>
              )}

              {expired && (
                <p className="text-center text-xs text-red-600">The application deadline has passed.</p>
              )}
              {applicationCheckError && (
                <p className="text-center text-xs text-red-600">
                  Application status could not be verified. Please reload this page.
                </p>
              )}
              {applyMessage && !alreadyApplied && (
                <p role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-600">
                  {applyMessage}
                </p>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Role Type:</span>
                <span className="font-bold text-navy">{o.type.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Location:</span>
                <span className="font-bold text-navy">{o.location || 'Remote'}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Verification:</span>
                <span className="font-bold text-emerald-700">Verified Employer</span>
              </div>
            </div>
          </section>

          {/* Tips Card */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 text-xs text-amber-950">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <Icon name="info" className="size-4 shrink-0" />
              Tip for Applicants
            </p>
            <p className="mt-1.5 leading-relaxed text-amber-800">
              Make sure your verified skills in your profile match the target skills of this role to maximize your matching score.
            </p>
          </div>
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
