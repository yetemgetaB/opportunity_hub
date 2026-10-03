import FiltersPanel from '../../components/opportunities/FiltersPanel'
import OpportunityListCard from '../../components/opportunities/OpportunityListCard'
import { OPPORTUNITIES } from '../../utils/studentData'

export default function OpportunitiesPage() {
  return (
    <div className="lg:flex lg:items-start lg:gap-6">
      <FiltersPanel />
      <div className="mt-6 min-w-0 flex-1 lg:mt-0">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          {/* TODO: wire "Showing N results" to the real filtered count */}
          <p className="text-slate-500">
            Showing {OPPORTUNITIES.length} results matching your profile
          </p>
          <p className="text-slate-500">
            Sort by: <span className="font-semibold text-navy">Best Match Score</span>
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {OPPORTUNITIES.map((o) => (
            <OpportunityListCard key={o.id} o={o} />
          ))}
        </div>
      </div>
    </div>
  )
}