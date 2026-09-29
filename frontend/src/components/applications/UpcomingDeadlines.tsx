import { Link } from 'react-router-dom'
import type { Deadline } from '../../types/student'

export default function UpcomingDeadlines({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-navy">Upcoming Deadlines</h2>
        <Link to="/student/applications" className="text-xs font-semibold text-brand hover:underline">
          View all deadlines
        </Link>
      </div>
      <ul className="mt-4 divide-y divide-slate-100">
        {deadlines.map((d) => (
          <li key={d.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">
              {d.company[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">{d.title}</p>
              <p className="truncate text-xs text-slate-500">
                {d.company} · {d.location} · <span className="text-amber-600">{d.type}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-sm font-bold ${d.urgent ? 'text-red-500' : 'text-navy'}`}>{d.due}</p>
              <p className="text-xs text-slate-400">{d.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}