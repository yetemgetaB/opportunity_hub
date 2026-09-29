import type { OpportunityHistoryItem, OpportunityStatus } from '../../types/organization'

const statusStyles: Record<OpportunityStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-600',
  Closed: 'bg-slate-100 text-slate-600',
  Draft: 'bg-amber-100 text-amber-600',
}

export default function OpportunityHistoryTable({ items }: { items: OpportunityHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-500">You haven't posted any opportunities yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
            <th className="px-4 py-3 font-medium">Opportunity</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Applicants</th>
            <th className="px-4 py-3 font-medium">Posted</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-4 font-semibold text-navy">{o.title}</td>
              <td className="px-4 py-4 text-slate-600">{o.type}</td>
              <td className="px-4 py-4 text-slate-600">{o.applicants}</td>
              <td className="px-4 py-4 text-slate-600">{o.postedDate}</td>
              <td className="px-4 py-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[o.status]}`}>{o.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}