import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import CreateOpportunityPrompt from '../../components/opportunities/CreateOpportunityPrompt'
import OpportunityHistoryTable from '../../components/opportunities/OpportunityHistoryTable'
import { OPPORTUNITY_HISTORY } from '../../utils/organizationData'

type Tab = 'create' | 'history'

export default function OpportunitiesPage() {
  const [tab, setTab] = useState<Tab>('create')
  const location = useLocation()
  const notice = (location.state as { notice?: string } | null)?.notice

  return (
    <div>
      <header className="mb-7">
        <h2 className="font-display text-3xl font-bold text-slate-900">My Opportunities</h2>
        <p className="mt-1.5 text-base text-gray-500">Manage your postings and review your hiring history.</p>
      </header>
      {notice && (
        <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      )}

      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-neutral-200 bg-white p-1" role="tablist">
        <button
          type="button"
          role="tab"
          id="organization-create-tab"
          aria-selected={tab === 'create'}
          aria-controls="organization-opportunity-panel"
          onClick={() => setTab('create')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
            tab === 'create' ? 'bg-slate-800 text-white' : 'text-gray-500 hover:bg-slate-50'
          }`}
        >
          <Icon name="plus" className="size-4" />
          Create New Opportunity
        </button>
        <button
          type="button"
          role="tab"
          id="organization-history-tab"
          aria-selected={tab === 'history'}
          aria-controls="organization-opportunity-panel"
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
            tab === 'history' ? 'bg-slate-800 text-white' : 'text-gray-500 hover:bg-slate-50'
          }`}
        >
          <Icon name="clipboard" className="size-4" />
          Opportunity History
        </button>
      </div>

      <div
        id="organization-opportunity-panel"
        role="tabpanel"
        aria-labelledby={tab === 'create' ? 'organization-create-tab' : 'organization-history-tab'}
        className="mt-5"
      >
        {tab === 'create' ? <CreateOpportunityPrompt /> : <OpportunityHistoryTable items={OPPORTUNITY_HISTORY} />}
      </div>
    </div>
  )
}