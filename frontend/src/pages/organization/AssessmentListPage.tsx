/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { assessmentService, type AssessmentResult } from '../../services/assessmentService'
import { opportunityService } from '../../services/opportunityService'
import type { OrganizationOpportunity } from '../../types/opportunity'

export default function AssessmentListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedOpportunityId = searchParams.get('opportunityId') ?? ''
  const [opportunities, setOpportunities] = useState<OrganizationOpportunity[]>([])
  const [results, setResults] = useState<AssessmentResult[]>([])
  const [eligibleCount, setEligibleCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    opportunityService.getMyOpportunities().then((items) => {
      if (!active) return
      setOpportunities(items)
      if (!selectedOpportunityId && items[0]) {
        setSearchParams({ opportunityId: items[0].id }, { replace: true })
      } else if (selectedOpportunityId && !items.some((item) => item.id === selectedOpportunityId)) {
        setError('The selected opportunity is not available in your organization.')
      }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Unable to load your opportunities.')
    })
    return () => { active = false }
  }, [selectedOpportunityId, setSearchParams])

  useEffect(() => {
    if (!selectedOpportunityId || !opportunities.some((item) => item.id === selectedOpportunityId)) {
      setResults([])
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    assessmentService.getCandidateResults(selectedOpportunityId)
      .then((items) => { if (active) setResults(items) })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load assessment results.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [opportunities, selectedOpportunityId])

  async function checkEligibleApplicants() {
    if (!selectedOpportunityId) return
    setAnalyzing(true)
    setError('')
    try {
      const result = await assessmentService.analyzeApplicants(selectedOpportunityId)
      setEligibleCount(result.totalEligibleApplicants)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Unable to check assessment eligibility.')
    } finally {
      setAnalyzing(false)
    }
  }

  const selectedOpportunity = opportunities.find((item) => item.id === selectedOpportunityId)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-navy">AI Assessment Results</h1>
        <p className="mt-1 text-sm text-slate-500">View stored assessment results and check applicant eligibility.</p>
      </header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-end sm:justify-between">
        <label className="min-w-0 flex-1 text-sm font-semibold text-slate-800 sm:max-w-xl">
          Opportunity
          <select
            value={selectedOpportunityId}
            onChange={(event) => {
              setEligibleCount(null)
              setSearchParams(event.target.value ? { opportunityId: event.target.value } : {})
            }}
            className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
          >
            {!opportunities.length && <option value="">No opportunities available</option>}
            {opportunities.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void checkEligibleApplicants()}
          disabled={!selectedOpportunityId || analyzing}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="sparkles" className="size-4" />
          {analyzing ? 'Checking…' : 'Check Eligibility'}
        </button>
      </section>
      {eligibleCount !== null && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {eligibleCount} eligible applicant{eligibleCount === 1 ? '' : 's'} returned. This endpoint checks eligibility; it does not generate or submit an assessment.
        </p>
      )}

      <section className="overflow-x-auto rounded-xl border border-neutral-200 bg-white p-2">
        {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading results…</p> : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Assessment</th>
                <th className="px-4 py-3">Final score</th>
                <th className="px-4 py-3">Approval</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => {
                const candidate = result.attempt.application.studentProfile.user
                const name = [candidate.firstName, candidate.middleName, candidate.lastName].filter(Boolean).join(' ')
                return (
                  <tr key={result.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-4 font-semibold text-navy">{name}</td>
                    <td className="px-4 py-4 text-slate-600">{result.attempt.assessment.title}</td>
                    <td className="px-4 py-4 text-slate-600">{result.finalScore}</td>
                    <td className="px-4 py-4 text-slate-600">{result.isFinalApproved ? 'Approved' : 'Pending approval'}</td>
                    <td className="px-4 py-4 text-right">
                      <Link to={`/organization/applicants/${result.attempt.application.id}/assessment`} className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
                        View <Icon name="arrowRight" className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {!results.length && !loading && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                  {selectedOpportunity ? `No stored assessment results for ${selectedOpportunity.title}.` : 'Select an opportunity to view results.'}
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
