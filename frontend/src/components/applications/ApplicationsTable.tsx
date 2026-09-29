import ApplicationStatusBadge from './ApplicationStatusBadge'
import type { ApplicationFilter } from './ApplicationTabs'
import { isPrevious } from '../../utils/applicationData'
import type { ApplicationItem } from '../../types/application'

type Props = {
  items: ApplicationItem[]
  filter: ApplicationFilter
  onView: (a: ApplicationItem) => void
}

export default function ApplicationsTable({ items, filter, onView }: Props) {
  const sections = [
    { label: 'Active Applications', rows: items.filter((a) => !isPrevious(a.status)), show: filter !== 'previous', muted: false },
    { label: 'Previous Applications', rows: items.filter((a) => isPrevious(a.status)), show: filter !== 'active', muted: true },
  ].filter((s) => s.show && s.rows.length > 0)

  if (sections.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-500">You haven't applied to anything yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
            <th className="px-4 py-3 font-medium">Position</th>
            <th className="px-4 py-3 font-medium">Applied</th>
            <th className="px-4 py-3 font-medium">AI Match</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        {sections.map((s) => (
          <tbody key={s.label}>
            <tr>
              <td colSpan={5} className="px-4 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {s.label}
              </td>
            </tr>
            {s.rows.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                      {a.company[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{a.title}</p>
                      <p className="truncate text-xs text-slate-400">
                        {a.company} · {a.location}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-600">{a.appliedDate}</td>
                <td className={`px-4 py-3.5 font-semibold ${s.muted ? 'text-slate-400' : 'text-amber-500'}`}>
                  {a.matchScore}%
                </td>
                <td className="px-4 py-3.5">
                  <ApplicationStatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onView(a)}
                    className="rounded-md bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-light"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}