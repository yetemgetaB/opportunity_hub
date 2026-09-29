import AssessmentScoreRing from './AssessmentScoreRing'
import type { AssessmentEvaluation } from '../../types/organization'

export default function AssessmentApplicantHeader({ a }: { a: AssessmentEvaluation }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-navy text-lg font-bold text-white">
          {a.initials}
        </span>
        <div>
          <h2 className="text-lg font-bold text-navy">{a.applicantName}</h2>
          <p className="text-sm text-slate-500">
            {a.university} · {a.degree}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-400">AI Match Score</p>
          <p className="text-sm font-bold text-amber-600">{a.recommendationLabel}</p>
        </div>
        <AssessmentScoreRing score={a.matchScore} />
      </div>
    </div>
  )
}