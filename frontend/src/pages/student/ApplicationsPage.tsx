import { useState } from 'react'
import ApplicationStatsRow from '../../components/applications/ApplicationStatsRow'
import ApplicationTabs, { type ApplicationFilter } from '../../components/applications/ApplicationTabs'
import ApplicationsTable from '../../components/applications/ApplicationsTable'
import ApplicationDetailsModal from '../../components/applications/ApplicationDetailsModal'
import { APPLICATIONS, isPrevious } from '../../utils/applicationData'
import type { ApplicationItem } from '../../types/application'

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<ApplicationFilter>('all')
  const [selected, setSelected] = useState<ApplicationItem | null>(null)

  const counts = {
    all: APPLICATIONS.length,
    active: APPLICATIONS.filter((a) => !isPrevious(a.status)).length,
    previous: APPLICATIONS.filter((a) => isPrevious(a.status)).length,
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy">My Applications</h2>
      <p className="mt-1 text-sm text-slate-500">Track every application you've submitted, past and present.</p>

      <div className="mt-6">
        <ApplicationStatsRow items={APPLICATIONS} />
      </div>

      <div className="mt-6">
        <ApplicationTabs active={filter} onChange={setFilter} counts={counts} />
      </div>

      <div className="mt-4">
        <ApplicationsTable items={APPLICATIONS} filter={filter} onView={setSelected} />
      </div>

      {selected && <ApplicationDetailsModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}