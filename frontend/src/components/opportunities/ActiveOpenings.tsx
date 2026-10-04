import type { ActiveOpening } from '../../types/organization'

type Props = { openings: ActiveOpening[]; total: number }

export default function ActiveOpenings({ openings, total }: Props) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-slate-900">My Active Openings</h2>
        <span className="text-xs font-semibold text-gray-500">{total} total</span>
      </div>
      <ul className="mt-4 space-y-3">
        {openings.map((o) => (
          <li key={o.id} className="rounded-lg border border-neutral-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">{o.title}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
              <span className="text-gray-500">{o.applicants} applicants</span>
              <span className={`font-semibold ${o.urgent ? 'text-red-500' : 'text-gray-500'}`}>Deadline: {o.deadline}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}