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
    { rows: items.filter((a) => !isPrevious(a.status)), show: filter !== 'previous' },
    { rows: items.filter((a) => isPrevious(a.status)), show: filter !== 'active' },
  ].filter((section) => section.show && section.rows.length > 0)

  if (sections.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-500">You haven't applied to anything yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
            <th scope="col" className="w-40 px-4 py-3">Company</th>
            <th scope="col" className="w-56 px-4 py-3">Position</th>
            <th scope="col" className="w-32 px-4 py-3">Date Applied</th>
            <th scope="col" className="w-40 px-4 py-3">Status</th>
            <th scope="col" className="w-28 px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        {sections.map((section, index) => (
          <tbody key={index}>
            {section.rows.map((application) => (
              <tr key={application.id} className="border-b border-slate-200 last:border-b-0">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-800 text-sm font-bold text-white">
                      {application.company[0]}
                    </span>
                    <span className="font-semibold text-slate-900">{application.company}</span>
                  </div>
                </td>
                <td className="max-w-56 px-4 py-4 font-medium text-slate-900">
                  <span className="block truncate">{application.title}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-500">{application.appliedDate}</td>
                <td className="px-4 py-4">
                  <ApplicationStatusBadge status={application.status} />
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onView(application)}
                    className="whitespace-nowrap rounded-sm bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    View Detail
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