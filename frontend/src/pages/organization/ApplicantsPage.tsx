import ApplicantStatsRow from '../../components/applicants/ApplicantStatsRow'
import ApplicantsTable from '../../components/applicants/ApplicantsTable'
import Icon from '../../components/ui/Icon'
import { APPLICANTS, APPLICANTS_OPPORTUNITY_TITLE } from '../../utils/organizationData'

export default function ApplicantsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Viewing applicants for</p>
          {/* TODO: turn this into a real opportunity picker once there's more than one posting to view */}
          <div className="mt-2 flex items-center gap-2 text-lg font-bold text-navy">
            {APPLICANTS_OPPORTUNITY_TITLE}
            <Icon name="chevronDown" className="h-4 w-4 text-slate-400" />
          </div>
        </div>
        {/* TODO: wire this up to a real CSV/PDF export */}
        <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-navy hover:bg-slate-50">
          <Icon name="download" className="h-4 w-4" />
          Export Data
        </button>
      </div>

      <div className="mt-6">
        <ApplicantStatsRow />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {/* TODO: wire these up to real filtering/sorting */}
          <button className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-navy">
            Status: All <Icon name="chevronDown" className="h-3.5 w-3.5" />
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-navy">
            Sort: Match Score <Icon name="chevronDown" className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex gap-3">
          <button className="rounded-md border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">
            Shortlist Selected
          </button>
          <button className="rounded-md bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-light">
            Send Assessment
          </button>
        </div>
      </div>

      <div className="mt-4">
        <ApplicantsTable applicants={APPLICANTS} />
      </div>
    </div>
  )
}