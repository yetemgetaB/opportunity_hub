import type { ApplicantListItem, ApplicantProfileDetail } from '../../types/organization'

export default function ApplicantProfileHeader({
  a,
  applicant,
}: {
  a: ApplicantProfileDetail
  applicant?: ApplicantListItem
}) {
  return (
    <section className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy text-lg font-bold text-white">
          {a.initials}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Applicant Profile</p>
          <h2 className="mt-1 text-xl font-bold text-navy">{a.name}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {a.university} <span className="mx-1.5 text-slate-300">·</span> {a.track}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:justify-end sm:border-0 sm:pt-0">
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{a.year}</span>
        {applicant && (
          <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:pl-5">
            <div className="text-left sm:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">AI match score</p>
              <p className="mt-1 text-sm font-semibold text-brand">{applicant.matchTier}</p>
            </div>
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full p-1"
              style={{ background: `conic-gradient(#f3a311 ${applicant.matchScore}%, #fff2d6 ${applicant.matchScore}% 100%)` }}
              aria-label={`AI match score ${applicant.matchScore}%`}
            >
              <span className="grid h-full w-full place-items-center rounded-full bg-white text-sm font-bold text-navy">
                {applicant.matchScore}%
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}