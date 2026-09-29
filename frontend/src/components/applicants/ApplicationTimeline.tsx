import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import type { TimelineEvent } from '../../types/organization'

export default function ApplicationTimeline({ applicantId, events }: { applicantId: string; events: TimelineEvent[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-navy">Application Timeline</h2>
      <ul className="mt-5 space-y-5">
        {events.map((e) => (
          <li key={e.id} className="flex gap-3">
            <span
              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                e.done ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-500'
              }`}
            >
              <Icon name={e.done ? 'check' : 'clock'} className="h-3 w-3" />
            </span>
            <div>
              <p className="text-sm font-semibold text-navy">{e.label}</p>
              <p className="text-xs text-slate-400">{e.date}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        to={`/organization/applicants/${applicantId}/assessment`}
        className="mt-6 block w-full rounded-md bg-brand py-2.5 text-center text-xs font-semibold text-navy hover:brightness-110"
      >
        Review Assessment Details
      </Link>
    </section>
  )
}