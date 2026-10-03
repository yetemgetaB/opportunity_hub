import { Link, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import BookmarkIcon from '../../components/ui/BookmarkIcon'
import MatchBreakdownChart from '../../components/opportunities/MatchBreakdownChart'
import { useSaved } from '../../context/SavedContext'
import { OPPORTUNITIES } from '../../utils/studentData'

export default function OpportunityDetailPage() {
  const { id } = useParams()
  const { isSaved, toggleSaved } = useSaved()
  const o = OPPORTUNITIES.find((item) => item.id === id)

  if (!o) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">We couldn't find that opportunity.</p>
        <Link to="/student/opportunities" className="mt-3 inline-block text-sm font-semibold text-brand">
          Back to Browse Opportunities
        </Link>
      </div>
    )
  }

  const saved = isSaved(o.id)

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-navy px-8 py-10 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0, transparent 45%)' }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white text-lg font-bold text-navy">
            {o.company[0]}
          </span>
          <div>
            <p className="text-xl font-bold">{o.company}</p>
            <p className="text-sm text-slate-300">{o.tagline}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">{o.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {o.location} · <span className="font-semibold text-brand">{o.type}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Application Deadline</p>
          <p className="text-sm font-bold text-navy">{o.deadline}</p>
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-navy">Role Overview</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{o.overview}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">Key Requirements</h3>
            <ul className="mt-2 space-y-2">
              {o.requirements.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">Benefits</h3>
            <ul className="mt-2 space-y-2">
              {o.benefits.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* TODO: wire this up to a real application flow */}
            <Button className="w-full">Apply Now</Button>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => toggleSaved(o.id)}
                aria-pressed={saved}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md border py-2.5 text-xs font-semibold transition ${
                  saved ? 'border-brand bg-amber-50 text-amber-700' : 'border-slate-200 text-navy hover:bg-slate-50'
                }`}
              >
                <BookmarkIcon filled={saved} className="h-4 w-4" /> {saved ? 'Saved' : 'Save'}
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 py-2.5 text-xs font-semibold text-navy hover:bg-slate-50">
                <Icon name="share" className="h-4 w-4" /> Share
              </button>
            </div>
          </div>

          <MatchBreakdownChart overall={o.fit} items={o.matchBreakdown} />
        </div>
      </div>
    </div>
  )
}