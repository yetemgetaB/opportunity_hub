/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApplicantStatsRow from '../../components/applicants/ApplicantStatsRow'
import ApplicantsTable from '../../components/applicants/ApplicantsTable'
import Icon from '../../components/ui/Icon'
import type { ApplicantListItem, ApplicantStatus } from '../../types/organization'
import type { OrganizationOpportunity } from '../../types/opportunity'
import { applicationService } from '../../services/applicationService'
import { opportunityService } from '../../services/opportunityService'
import { useAuthContext } from '../../context/AuthContext'
import { toApplicantListItem, applicationStatusLabel } from '../../utils/applicantData'

type StatusFilter = 'ALL' | ApplicantStatus
type SortOption = 'Date Applied' | 'Applicant Name'
const statuses: StatusFilter[] = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']

export default function ApplicantsPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [applicants, setApplicants] = useState<ApplicantListItem[]>([])
  const [opportunities, setOpportunities] = useState<OrganizationOpportunity[]>([])
  const [opportunityId, setOpportunityId] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [sortBy, setSortBy] = useState<SortOption>('Date Applied')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const refresh = useCallback(async () => {
    if (user?.role !== 'ORGANIZATION') return
    setLoading(true)
    try {
      const allOpportunities = await opportunityService.getMyOpportunities()
      const selectedOpportunities = opportunityId === 'all'
        ? allOpportunities
        : allOpportunities.filter((item) => item.id === opportunityId)
      const applicantGroups = await Promise.all(selectedOpportunities.map(async (opportunity) => {
        const records = await applicationService.getApplicants(opportunity.id)
        return records.map((record) => toApplicantListItem(record, opportunity.id, opportunity.title))
      }))
      setOpportunities(allOpportunities)
      setApplicants(applicantGroups.flat())
      setSelectedIds([])
      setError('')
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Unable to load applicants.')
    } finally {
      setLoading(false)
    }
  }, [opportunityId, user?.role])

  useEffect(() => { void refresh() }, [refresh])

  const visibleApplicants = useMemo(() => {
    const filtered = applicants.filter((applicant) => statusFilter === 'ALL' || applicant.status === statusFilter)
    return [...filtered].sort((a, b) => sortBy === 'Applicant Name'
      ? a.name.localeCompare(b.name)
      : new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
  }, [applicants, sortBy, statusFilter])

  const visibleIds = visibleApplicants.map((applicant) => applicant.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

  function toggleApplicant(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id])
  }

  function toggleAllVisible() {
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])])
  }

  async function shortlistSelected() {
    const selected = applicants.filter((applicant) => selectedIds.includes(applicant.id))
    setUpdating(true)
    setError('')
    try {
      await Promise.all(selected.map((applicant) =>
        applicationService.updateStatus(applicant.opportunityId, applicant.id, 'SHORTLISTED')))
      await refresh()
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Unable to shortlist applicants.')
    } finally {
      setUpdating(false)
    }
  }

  function exportApplicants() {
    const csv = [
      ['Applicant Name', 'Opportunity', 'University', 'Status', 'Date Applied'],
      ...visibleApplicants.map((applicant) => [
        applicant.name,
        applicant.position,
        applicant.university,
        applicationStatusLabel(applicant.status),
        applicant.dateApplied,
      ]),
    ].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'applicants.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const opportunityName = opportunityId === 'all'
    ? 'All opportunities'
    : opportunities.find((item) => item.id === opportunityId)?.title ?? 'All opportunities'

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Viewing applicants for</p>
          <label className="relative mt-2 block">
            <span className="sr-only">Opportunity</span>
            <select
              value={opportunityId}
              onChange={(event) => setOpportunityId(event.target.value)}
              aria-label="Opportunity"
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-lg font-bold text-navy sm:w-auto"
            >
              <option value="all">All opportunities</option>
              {opportunities.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>
        </div>
        <button
          type="button"
          onClick={exportApplicants}
          disabled={!visibleApplicants.length}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-navy transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <Icon name="download" className="h-4 w-4" />Export Data
        </button>
      </section>

      <p className="sr-only" aria-live="polite">Viewing {applicants.length} applicants for {opportunityName}.</p>
      <ApplicantStatsRow applicants={applicants} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <label className="relative">
              <span className="sr-only">Filter applicants by status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="rounded-md border border-slate-200 bg-white py-2 pl-3 pr-4 text-xs font-semibold text-slate-600">
                {statuses.map((status) => <option key={status} value={status}>{status === 'ALL' ? 'Status: All' : `Status: ${applicationStatusLabel(status)}`}</option>)}
              </select>
            </label>
            <label className="relative">
              <span className="sr-only">Sort applicants</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value === 'Applicant Name' ? 'Applicant Name' : 'Date Applied')} className="rounded-md border border-slate-200 bg-white py-2 pl-3 pr-4 text-xs font-semibold text-slate-600">
                {(['Date Applied', 'Applicant Name'] as SortOption[]).map((option) => <option key={option} value={option}>Sort: {option}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="inline-flex items-center gap-2 pr-2 text-xs font-semibold text-slate-500">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} disabled={!visibleIds.length} className="h-4 w-4 rounded border-slate-300 accent-brand" />
              Select all
            </label>
            <button type="button" onClick={shortlistSelected} disabled={!selectedIds.length || updating} className="rounded-md border border-emerald-500 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">
              {updating ? 'Updating…' : `Shortlist Selected${selectedIds.length ? ` (${selectedIds.length})` : ''}`}
            </button>
            <button
              type="button"
              onClick={() => {
                const first = applicants.find((applicant) => selectedIds.includes(applicant.id))
                if (first) navigate(`/organization/assessment?opportunityId=${encodeURIComponent(first.opportunityId)}`)
              }}
              disabled={!selectedIds.length}
              className="rounded-md bg-navy px-3.5 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              View AI Results
            </button>
          </div>
        </div>
        <div className="mt-4">
          {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading applicants…</p> : (
            <ApplicantsTable applicants={visibleApplicants} selectedIds={selectedIds} onToggleApplicant={toggleApplicant} allSelected={allVisibleSelected} onToggleAll={toggleAllVisible} />
          )}
        </div>
      </section>
    </div>
  )
}
