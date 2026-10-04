import { Link } from 'react-router-dom'
import type { Deadline } from '../../types/student'

export default function UpcomingDeadlines({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-black">Upcoming Deadlines</h2>
        <Link to="/student/applications" className="shrink-0 text-sm font-semibold text-brand hover:underline">
          View all deadlines
        </Link>
      </div>
      <ul className="space-y-3">
        {deadlines.map((d) => (
          <li key={d.id} className="flex min-h-20 items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:gap-4 sm:px-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-navy font-display text-lg font-bold text-white">
              {d.company[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-black">{d.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                <span>{d.company}</span>
                <span className="size-1 rounded-full bg-gray-500" aria-hidden="true" />
                <span>{d.location}</span>
                <span className="size-1 rounded-full bg-gray-500" aria-hidden="true" />
                <span className="font-semibold text-brand">{d.type}</span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-sm font-bold ${d.urgent ? 'text-red-600' : 'text-navy'}`}>{d.due}</p>
              <p className="mt-0.5 text-xs text-gray-500">{d.status}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}