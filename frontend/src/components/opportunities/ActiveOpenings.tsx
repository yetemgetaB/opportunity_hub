import type { ActiveOpening } from '../../types/organization'

type Props = { openings: ActiveOpening[]; total: number }

export default function ActiveOpenings({ openings, total }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-navy">My Active Openings</h2>
        <span className="text-xs text-slate-500">{total} total</span>
      </div>
      <ul className="mt-5 space-y-4">
        {openings.map((o) => (
          <li key={o.id} className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-navy">{o.title}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">{o.applicants} applicants</span>
              <span className={`font-semibold ${o.urgent ? 'text-red-500' : 'text-navy'}`}>Deadline: {o.deadline}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}