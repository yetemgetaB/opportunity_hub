import AssessmentScoreRing from './AssessmentScoreRing'
import type { AssessmentEvaluation } from '../../types/organization'

export default function AssessmentApplicantHeader({ a }: { a: AssessmentEvaluation }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy text-xl font-bold text-white sm:h-20 sm:w-20">
          {a.initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className="font-display text-2xl font-bold text-navy">{a.applicantName}</h2>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
            {a.recommendationLabel}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-500">
          {a.university} <span className="mx-1.5 text-slate-300">·</span> {a.degree}
        </p>
      </div>
      <div className="flex items-center gap-4 border-t border-neutral-200 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
        <div className="min-w-24">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">AI Match Score</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">Overall assessment</p>
        </div>
        <AssessmentScoreRing score={a.matchScore} />
      </div>
    </section>
  )
}