/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AssessmentResult } from '../../services/assessmentService'
import { assessmentService } from '../../services/assessmentService'
import { applicationService } from '../../services/applicationService'
import { opportunityService } from '../../services/opportunityService'
import type { OrganizationOpportunity } from '../../types/opportunity'

export default function AssessmentPage() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<AssessmentResult>()
  const [opportunity, setOpportunity] = useState<OrganizationOpportunity>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setError('No application was selected.')
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    opportunityService.getMyOpportunities().then(async (opportunities) => {
      const applications = await Promise.all(opportunities.map(async (item) => ({
        opportunity: item,
        applicants: await applicationService.getApplicants(item.id),
      })))
      const match = applications.find((entry) => entry.applicants.some((applicant) => applicant.application.id === id))
      if (!match) throw new Error('No assessment is available for this application.')
      const results = await assessmentService.getCandidateResults(match.opportunity.id)
      const candidateResult = results.find((item) => item.attempt.application.id === id)
      if (!candidateResult) throw new Error('No saved assessment result is available for this application.')
      if (active) {
        setOpportunity(match.opportunity)
        setResult(candidateResult)
        setError('')
      }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Unable to load this assessment result.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <div className="h-80 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-label="Loading assessment result" />

  if (!result || !opportunity) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <h1 className="font-display text-lg font-bold text-navy">Assessment result unavailable</h1>
        <p role="alert" className="mt-2 text-sm text-slate-500">{error || 'No saved result exists for this application.'}</p>
        <Link to="/organization/assessment" className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-navy">Back to AI Assessment</Link>
      </div>
    )
  }

  const application = result.attempt.application
  const candidate = application.studentProfile
  const name = [candidate.user.firstName, candidate.user.middleName, candidate.user.lastName].filter(Boolean).join(' ')

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link to={`/organization/assessment?opportunityId=${encodeURIComponent(opportunity.id)}`} className="text-sm font-semibold text-brand hover:underline">← AI Assessment Results</Link>
      <header className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">{opportunity.title}</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-navy">{name}</h1>
        <p className="mt-1 text-sm text-slate-500">{candidate.university} · {candidate.fieldOfStudy} · {result.attempt.assessment.title}</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs text-slate-500">Final score</p>
          <p className="mt-2 font-display text-3xl font-bold text-navy">{result.finalScore}</p>
        </article>
        <article className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs text-slate-500">AI score</p>
          <p className="mt-2 font-display text-3xl font-bold text-navy">{result.aiScore ?? 'Not scored'}</p>
        </article>
        <article className="rounded-xl border border-neutral-200 bg-white p-5">
          <p className="text-xs text-slate-500">Final review</p>
          <p className="mt-2 text-sm font-semibold text-navy">{result.isFinalApproved ? 'Approved' : 'Pending approval'}</p>
        </article>
      </section>
      <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-navy">Summary</h2>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{result.finalSummary || result.aiSummary || 'No summary has been saved.'}</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-navy">Strengths</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {(result.finalStrengths.length ? result.finalStrengths : result.aiStrengths).map((strength) => <li key={strength}>• {strength}</li>)}
              {!result.finalStrengths.length && !result.aiStrengths.length && <li>No strengths recorded.</li>}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-navy">Areas for improvement</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {(result.finalGaps.length ? result.finalGaps : result.aiGaps).map((gap) => <li key={gap}>• {gap}</li>)}
              {!result.finalGaps.length && !result.aiGaps.length && <li>No gaps recorded.</li>}
            </ul>
          </div>
        </div>
        <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
          Results are read-only here. The backend currently exposes result retrieval but no recruiter approval, feedback, interview scheduling, or assessment-answer endpoints.
        </p>
      </section>
    </div>
  )
}
