import type { OpportunityHistoryItem, OpportunityStatus } from '../../types/organization'

const statusStyles: Record<OpportunityStatus, string> = {
  Active: 'bg-emerald-500/10 text-emerald-600',
  Closed: 'bg-slate-800/5 text-gray-500',
  Draft: 'bg-amber-500/10 text-amber-600',
}

export default function OpportunityHistoryTable({ items }: { items: OpportunityHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
        <p className="text-sm text-gray-500">You haven't posted any opportunities yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white p-2">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-xs font-semibold text-gray-500">
            <th className="px-4 py-3.5 font-semibold">Opportunity</th>
            <th className="px-4 py-3.5 font-semibold">Type</th>
            <th className="px-4 py-3.5 font-semibold">Applicants</th>
            <th className="px-4 py-3.5 font-semibold">Posted</th>
            <th className="px-4 py-3.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id} className="border-b border-neutral-100 last:border-0">
              <td className="px-4 py-4 font-semibold text-slate-900">{o.title}</td>
              <td className="px-4 py-4 text-gray-500">{o.type}</td>
              <td className="px-4 py-4 text-gray-500">{o.applicants}</td>
              <td className="px-4 py-4 text-gray-500">{o.postedDate}</td>
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