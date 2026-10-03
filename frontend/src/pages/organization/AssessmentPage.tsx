import { Link, useParams } from 'react-router-dom'
import AssessmentApplicantHeader from '../../components/assessment/AssessmentApplicantHeader'
import EvaluationBreakdown from '../../components/assessment/EvaluationBreakdown'
import KeyStrengthsCard from '../../components/assessment/KeyStrengthsCard'
import AreasToImproveCard from '../../components/assessment/AreasToImproveCard'
import RecommendationBar from '../../components/assessment/RecommendationBar'
import { ASSESSMENT_EVALUATIONS } from '../../utils/organizationData'

export default function AssessmentPage() {
  const { id } = useParams()
  const a = id ? ASSESSMENT_EVALUATIONS[id] : undefined

  if (!a) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">No assessment evaluation found for this applicant.</p>
        <Link to="/organization/applicants" className="mt-3 inline-block text-sm font-semibold text-brand">
          Back to Applicant Hub
        </Link>
      </div>
    )
  }

  return (
    <div>
      <AssessmentApplicantHeader a={a} />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <EvaluationBreakdown items={a.breakdown} />
        <div className="space-y-6">
          <KeyStrengthsCard items={a.keyStrengths} />
          <AreasToImproveCard items={a.areasToImprove} />
        </div>
      </div>

      <div className="mt-6">
        <RecommendationBar
          summary={a.summary}
          // TODO: replace these console logs with real applicant status updates once the backend exists
          onReject={() => console.log('Rejected', a.applicantId)}
          onSchedule={() => console.log('Scheduled interview for', a.applicantId)}
          onShortlist={() => console.log('Shortlisted', a.applicantId)}
        />
      </div>
    </div>
  )
}