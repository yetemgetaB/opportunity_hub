import Icon from '../ui/Icon'

type Props = {
  summary: string
  actionNotice: string
  onReject: () => void
  onSchedule: () => void
  onShortlist: () => void
}

export default function RecommendationBar({ summary, actionNotice, onReject, onSchedule, onShortlist }: Props) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
          <Icon name="sparkles" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">AI Recommendation</p>
          <h2 className="mt-0.5 font-display text-lg font-bold text-navy">Summary</h2>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-600">{summary}</p>

      <div className="mt-6 border-t border-neutral-200 pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Next step</p>
        <div className="grid gap-2.5">
          <button
            type="button"
            onClick={onShortlist}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <Icon name="check" className="h-4 w-4" />
            Shortlist Candidate
          </button>
          <button
            type="button"
            onClick={onSchedule}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            <Icon name="calendarEvent" className="h-4 w-4" />
            Schedule Interview
          </button>
          <button
            type="button"
            onClick={onReject}
            className="min-h-10 rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          >
            Reject applicant
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Applicant status changes and interview scheduling are not connected yet.
        </p>
      </div>

      {actionNotice && (
        <p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
          {actionNotice}
        </p>
      )}
    </section>
  )
}