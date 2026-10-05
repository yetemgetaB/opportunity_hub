import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ApplicantStatsRow from '../../components/applicants/ApplicantStatsRow'
import ApplicantsTable from '../../components/applicants/ApplicantsTable'
import Icon from '../../components/ui/Icon'
import type { ApplicantListItem, ApplicantStatus } from '../../types/organization'
import type { Opportunity } from '../../types/student'
import { opportunityService } from '../../services/opportunityService'
import { useAuthContext } from '../../context/AuthContext'

type StatusFilter = 'All' | ApplicantStatus
type SortOption = 'Match Score' | 'Date Applied' | 'Applicant Name'

const statuses: StatusFilter[] = ['All', 'Under Review', 'Interview', 'Shortlisted', 'Accepted']

export default function ApplicantsPage() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [applicants, setApplicants] = useState<ApplicantListItem[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [opportunityId, setOpportunityId] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [sortBy, setSortBy] = useState<SortOption>('Match Score')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (user?.role !== 'ORGANIZATION') return
    try {
      const [items] = await Promise.all([opportunityService.getMyOpportunities(user.id)])
      setOpportunities(items)
      setApplicants(opportunityService.getApplicants(user.id, opportunityId === 'all' ? undefined : opportunityId))
      setSelectedIds([])
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load applicants.')
    }
  }, [opportunityId, user])

  useEffect(() => { void refresh() }, [refresh])

  const visibleApplicants = useMemo(() => {
    const filtered = applicants.filter((applicant) => statusFilter === 'All' || applicant.status === statusFilter)
    return [...filtered].sort((a, b) => {
      if (sortBy === 'Applicant Name') return a.name.localeCompare(b.name)
      if (sortBy === 'Date Applied') return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
      return b.matchScore - a.matchScore
    })
  }, [applicants, sortBy, statusFilter])

  const visibleIds = visibleApplicants.map((applicant) => applicant.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

  const toggleApplicant = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id])
  }

  const toggleAllVisible = () => {
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])])
  }

  const shortlistSelected = async () => {
    try {
      selectedIds.forEach((id) => opportunityService.updateApplicantStatus(id, 'Shortlisted', user?.id))
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to shortlist applicants.')
    }
  }

  const sendAssessment = () => {
    if (selectedIds.length > 0) navigate(`/organization/applicants/${selectedIds[0]}/assessment`)
  }

  const exportApplicants = () => {
    const csv = [
      ['Applicant Name', 'AI Match Score', 'Skills Match', 'Status', 'Date Applied'],
      ...visibleApplicants.map((applicant) => [
        applicant.name,
        `${applicant.matchScore}%`,
        `${applicant.skillsMatch}%`,
        applicant.status,
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
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-lg font-bold text-navy disabled:cursor-default disabled:opacity-100 sm:w-auto"
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
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-navy transition hover:bg-slate-50 sm:self-auto"
        >
          <Icon name="download" className="h-4 w-4" />
          Export Data
        </button>
      </section>

      <p className="sr-only" aria-live="polite">Viewing {applicants.length} applicants for {opportunityName}.</p>
      <ApplicantStatsRow applicants={applicants} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <label className="relative">
              <span className="sr-only">Filter applicants by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-slate-600 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {statuses.map((status) => <option key={status} value={status}>Status: {status}</option>)}
              </select>
              <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            </label>
            <label className="relative">
              <span className="sr-only">Sort applicants</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="appearance-none rounded-md border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-slate-600 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {(['Match Score', 'Date Applied', 'Applicant Name'] as SortOption[]).map((option) => (
                  <option key={option} value={option}>Sort: {option}</option>
                ))}
              </select>
              <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            </label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="inline-flex items-center gap-2 pr-2 text-xs font-semibold text-slate-500">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
                disabled={visibleIds.length === 0}
                className="h-4 w-4 rounded border-slate-300 accent-brand"
              />
              Select all
            </label>
            <button
              type="button"
              onClick={shortlistSelected}
              disabled={selectedIds.length === 0}
              className="rounded-md border border-emerald-500 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Shortlist Selected{selectedIds.length ? ` (${selectedIds.length})` : ''}
            </button>
            <button
              type="button"
              onClick={sendAssessment}
              disabled={selectedIds.length === 0}
              className="rounded-md bg-navy px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Assessment{selectedIds.length ? ` (${selectedIds.length})` : ''}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <ApplicantsTable
            applicants={visibleApplicants}
            selectedIds={selectedIds}
            onToggleApplicant={toggleApplicant}
            allSelected={allVisibleSelected}
            onToggleAll={toggleAllVisible}
          />
        </div>
      </section>
    </div>
  )
}
