type Props = {
  summary: string
  onReject: () => void
  onSchedule: () => void
  onShortlist: () => void
}

export default function RecommendationBar({ summary, onReject, onSchedule, onShortlist }: Props) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">AI Recommendation & Summary</p>
        <p className="mt-1 text-sm text-slate-600">{summary}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {/* TODO: wire these up to real applicant status updates */}
        <button
          onClick={onReject}
          className="rounded-md border border-red-300 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50"
        >
          Reject
        </button>
        <button
          onClick={onSchedule}
          className="rounded-md border border-slate-200 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-slate-50"
        >
          Schedule Interview
        </button>
        <button
          onClick={onShortlist}
          className="rounded-md bg-brand px-4 py-2.5 text-xs font-semibold text-navy hover:brightness-110"
        >
          Shortlist Candidate
        </button>
      </div>
    </section>
  )
}