/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import ApplicationPipeline from '../../components/applications/ApplicationPipeline'
import ApplicationTabs, { type ApplicationFilter } from '../../components/applications/ApplicationTabs'
import ApplicationsTable from '../../components/applications/ApplicationsTable'
import ApplicationDetailsModal from '../../components/applications/ApplicationDetailsModal'
import { applicationDateLabel, applicationOrganizationName, isPrevious } from '../../utils/applicationData'
import type { ApplicationItem } from '../../types/application'
import { applicationService } from '../../services/applicationService'
import { useAuthContext } from '../../context/AuthContext'

export default function ApplicationsPage() {
  const { user } = useAuthContext()
  const [filter, setFilter] = useState<ApplicationFilter>('all')
  const [selected, setSelected] = useState<ApplicationItem | null>(null)
  const [items, setItems] = useState<ApplicationItem[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'STUDENT') {
      setItems([])
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    applicationService.getMyApplications()
      .then((result) => {
        if (active) {
          setItems(result)
          setError('')
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load your applications.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user?.id, user?.role])

  const counts = useMemo(() => ({
    all: items.length,
    active: items.filter((application) => !isPrevious(application.status)).length,
    previous: items.filter((application) => isPrevious(application.status)).length,
  }), [items])

  function exportApplications() {
    const headers = ['Organization', 'Position', 'Date Applied', 'Status']
    const rows = items.map((item) => [
      applicationOrganizationName(item),
      item.opportunity?.title ?? 'Opportunity',
      applicationDateLabel(item.appliedAt),
      item.status,
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'application-tracker.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  async function handleWithdraw(applicationId: string) {
    try {
      await applicationService.withdrawApplication(applicationId)
      setItems((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: 'WITHDRAWN' as const } : app))
      )
      if (selected && selected.id === applicationId) {
        setSelected({ ...selected, status: 'WITHDRAWN' as const })
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Unable to withdraw application.')
    }
  }

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <ApplicationPipeline items={items} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <ApplicationTabs active={filter} onChange={setFilter} counts={counts} onExport={exportApplications} />
        </div>
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">Loading applications…</p>
        ) : items.length ? (
          <ApplicationsTable items={items} filter={filter} onView={setSelected} />
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-800">No applications yet</p>
            <p className="mt-1 text-sm text-slate-500">Apply to an opportunity to see its progress here.</p>
          </div>
        )}
      </section>

      {selected && (
        <ApplicationDetailsModal
          item={selected}
          onClose={() => setSelected(null)}
          onWithdraw={handleWithdraw}
        />
      )}
    </div>
  )
}
