import ApplicationStatusBadge from './ApplicationStatusBadge'
import type { ApplicationFilter } from './ApplicationTabs'
import { isPrevious } from '../../utils/applicationData'
import type { ApplicationItem } from '../../types/application'
import { applicationDateLabel, applicationOrganizationName } from '../../utils/applicationData'

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
              <tr key={application.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 transition">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy font-display text-xs font-bold text-white shadow-xs">
                      {applicationOrganizationName(application)[0]}
                    </span>
                    <span className="font-semibold text-navy">{applicationOrganizationName(application)}</span>
                  </div>
                </td>
                <td className="max-w-56 px-4 py-3.5 font-medium text-slate-900">
                  <span className="block truncate">{application.opportunity?.title ?? 'Opportunity'}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{applicationDateLabel(application.appliedAt)}</td>
                <td className="px-4 py-3.5">
                  <ApplicationStatusBadge status={application.status} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => onView(application)}
                    className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition active:scale-[0.98]"
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