import type { Opportunity } from '../../types/opportunity'

export default function OpportunityCard({ o }: { o: Opportunity }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{o.type}</span>
      <h3 className="mt-4 font-bold text-navy">{o.title}</h3>
      <p className="mt-1 text-sm text-slate-600">{o.organization}</p>
      <p className="mb-5 mt-4 text-xs text-slate-500">{o.location} · Closes {o.deadline}</p>
      <button className="mt-auto rounded-md border border-slate-300 py-2 text-sm font-semibold text-navy hover:bg-slate-50">
        View details
      </button>
    </article>
  )
}