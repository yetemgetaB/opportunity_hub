import { JOB_TYPES } from '../../utils/studentData'

const SUB_TYPES = new Set(['Paid Internship', 'Unpaid Internship'])

export default function FiltersPanel() {
  return (
    <aside className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-5 lg:w-64">
      <h2 className="text-sm font-bold text-navy">Filters</h2>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Job Type</p>
        <div className="mt-3 space-y-2">
          {JOB_TYPES.map((t, i) => (
            <label
              key={t}
              className={`flex items-center gap-2 text-sm text-slate-600 ${SUB_TYPES.has(t) ? 'ml-5' : ''}`}
            >
              <input type="checkbox" defaultChecked={i === 0} className="accent-brand" />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Field of Study</p>
        {/* TODO: wire this up to real filtering, e.g. with autocomplete suggestions */}
        <input
          placeholder="e.g. Computer Science"
          className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-brand"
        />
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Location</p>
        <input
          defaultValue="San Francisco, CA"
          className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-navy outline-none focus:border-brand"
        />
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience Level</p>
        <input
          defaultValue="Entry Level (0-1 yrs)"
          className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-navy outline-none focus:border-brand"
        />
      </div>
    </aside>
  )
}
