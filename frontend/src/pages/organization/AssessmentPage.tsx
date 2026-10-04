import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AreasToImproveCard from '../../components/assessment/AreasToImproveCard'
import AssessmentApplicantHeader from '../../components/assessment/AssessmentApplicantHeader'
import EvaluationBreakdown from '../../components/assessment/EvaluationBreakdown'
import KeyStrengthsCard from '../../components/assessment/KeyStrengthsCard'
import RecommendationBar from '../../components/assessment/RecommendationBar'
import { ASSESSMENT_EVALUATIONS } from '../../utils/organizationData'

export default function AssessmentPage() {
  const { id } = useParams()
  const [actionNotice, setActionNotice] = useState('')
  const a = id ? ASSESSMENT_EVALUATIONS[id] : undefined

  if (!a) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <h2 className="font-display text-lg font-bold text-navy">Assessment not found</h2>
        <p className="mt-2 text-sm text-slate-500">No assessment evaluation is available for this applicant.</p>
        <Link
          to="/organization/applicants"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-navy transition hover:brightness-95"
        >
          Back to Applicants
        </Link>
      </div>
    )
  }

  const profileHref = `/organization/applicants/${a.applicantId}`

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <Link
        to="/organization/applicants"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-navy"
      >
        <span aria-hidden="true">←</span>
        Applicants
      </Link>

      <AssessmentApplicantHeader a={a} />

      <nav
        aria-label="Applicant sections"
        className="mt-6 flex min-w-0 gap-6 overflow-x-auto border-b border-neutral-200"
      >
        <Link
          to={profileHref}
          className="shrink-0 border-b-[3px] border-transparent pb-3 text-sm font-medium text-slate-500 transition hover:text-navy"
        >
          Profile
        </Link>
        <button
          type="button"
          disabled
          title="Resume details are not available yet"
          className="shrink-0 cursor-not-allowed border-b-[3px] border-transparent pb-3 text-sm font-medium text-slate-400"
        >
          CV / Resume
        </button>
        <button
          type="button"
          disabled
          title="Test answers are not available yet"
          className="shrink-0 cursor-not-allowed border-b-[3px] border-transparent pb-3 text-sm font-medium text-slate-400"
        >
          Test Answers
        </button>
        <a
          href="#ai-analysis"
          aria-current="page"
          className="shrink-0 border-b-[3px] border-amber-500 pb-3 text-sm font-semibold text-amber-600"
        >
          AI Analysis
        </a>
      </nav>

      <div id="ai-analysis" className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <EvaluationBreakdown items={a.breakdown} />
          <div className="grid items-start gap-6 md:grid-cols-2">
            <KeyStrengthsCard items={a.keyStrengths} />
            <AreasToImproveCard items={a.areasToImprove} />
          </div>
        </div>

        <RecommendationBar
          summary={a.summary}
          actionNotice={actionNotice}
          onReject={() => setActionNotice('Reject is not connected to applicant status updates yet. No status was changed.')}
          onSchedule={() => setActionNotice('Interview scheduling is not connected yet. No interview was created.')}
          onShortlist={() => setActionNotice('Shortlisting is not connected to applicant status updates yet. No status was changed.')}
        />
      </div>
    </div>
  )
}
