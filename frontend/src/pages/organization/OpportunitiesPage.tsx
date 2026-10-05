import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import CreateOpportunityPrompt from '../../components/opportunities/CreateOpportunityPrompt'
import OpportunityHistoryTable from '../../components/opportunities/OpportunityHistoryTable'
import type { OpportunityHistoryItem } from '../../types/organization'
import { opportunityService } from '../../services/opportunityService'
import { useAuthContext } from '../../context/AuthContext'

type Tab = 'create' | 'history'

export default function OpportunitiesPage() {
  const [tab, setTab] = useState<Tab>('create')
  const [items, setItems] = useState<OpportunityHistoryItem[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const location = useLocation()
  const { user } = useAuthContext()

  const refresh = useCallback(async () => {
    if (user?.role !== 'ORGANIZATION') {
      setItems([])
      return
    }
    try {
      const opportunities = await opportunityService.getMyOpportunities(user.id)
      const mapped = opportunities.map((item): OpportunityHistoryItem => ({
        id: item.id,
        title: item.title,
        type: item.type,
        applicants: opportunityService.getApplicants(user.id, item.id).length,
        postedDate: item.createdAt
          ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(item.createdAt))
          : '—',
        status: item.status === 'DRAFT' ? 'Draft' : item.status === 'CLOSED' ? 'Closed' : 'Active',
      }))
      setItems(mapped)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load your opportunities.')
    }
  }, [user])

  useEffect(() => { void refresh() }, [refresh])

  useEffect(() => {
    const state = location.state as { notice?: string; tab?: Tab } | null
    if (state?.notice) setNotice(state.notice)
    if (state?.tab) setTab(state.tab)
  }, [location.state])

  async function publish(id: string) {
    try {
      await opportunityService.publishOpportunity(id, user?.id)
      await refresh()
      setNotice('Opportunity published successfully.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to publish the opportunity.')
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this opportunity and its demo applications?')) return
    try {
      await opportunityService.deleteOpportunity(id, user?.id)
      await refresh()
      setNotice('Opportunity deleted.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete the opportunity.')
    }
  }

  return (
    <div>
      <header className="mb-7">
        <h2 className="font-display text-3xl font-bold text-slate-900">My Opportunities</h2>
        <p className="mt-1.5 text-base text-gray-500">Manage your postings and review your hiring history.</p>
      </header>
      {notice && <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-neutral-200 bg-white p-1" role="tablist">
        <button
          type="button"
          role="tab"
          id="organization-create-tab"
          aria-selected={tab === 'create'}
          aria-controls="organization-opportunity-panel"
          onClick={() => setTab('create')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${tab === 'create' ? 'bg-slate-800 text-white' : 'text-gray-500 hover:bg-slate-50'}`}
        >
          <Icon name="plus" className="size-4" />Create New Opportunity
        </button>
        <button
          type="button"
          role="tab"
          id="organization-history-tab"
          aria-selected={tab === 'history'}
          aria-controls="organization-opportunity-panel"
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${tab === 'history' ? 'bg-slate-800 text-white' : 'text-gray-500 hover:bg-slate-50'}`}
        >
          <Icon name="clipboard" className="size-4" />Opportunity History ({items.length})
        </button>
      </div>

      <div
        id="organization-opportunity-panel"
        role="tabpanel"
        aria-labelledby={tab === 'create' ? 'organization-create-tab' : 'organization-history-tab'}
        className="mt-5"
      >
        {tab === 'create'
          ? <CreateOpportunityPrompt />
          : <OpportunityHistoryTable items={items} onPublish={publish} onDelete={remove} />}
      </div>
    </div>
  )
}
