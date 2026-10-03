import { useState } from 'react'
import Icon from '../../components/ui/Icon'
import CreateOpportunityPrompt from '../../components/opportunities/CreateOpportunityPrompt'
import OpportunityHistoryTable from '../../components/opportunities/OpportunityHistoryTable'
import { OPPORTUNITY_HISTORY } from '../../utils/organizationData'

type Tab = 'create' | 'history'

export default function OpportunitiesPage() {
  const [tab, setTab] = useState<Tab>('create')

  return (
    <div>
      <h2 className="text-2xl font-bold text-navy">My Opportunities</h2>
      <p className="mt-1 text-sm text-slate-500">Manage your postings and review your hiring history.</p>

      <div className="mt-5 inline-flex gap-1 rounded-xl border border-slate-200 bg-white p-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'create'}
          onClick={() => setTab('create')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
            tab === 'create' ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Icon name="plus" className="h-4 w-4" />
          Create New Opportunity
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'history'}
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
            tab === 'history' ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Icon name="clipboard" className="h-4 w-4" />
          Opportunity History
        </button>
      </div>

      <div className="mt-5">
        {tab === 'create' ? <CreateOpportunityPrompt /> : <OpportunityHistoryTable items={OPPORTUNITY_HISTORY} />}
      </div>
    </div>
  )
}