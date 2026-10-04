import { useState } from 'react'
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
  const [shareMessage, setShareMessage] = useState('')
  const o = OPPORTUNITIES.find((item) => item.id === id)

  if (!o) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">We couldn't find that opportunity.</p>
        <Link to="/student/opportunities" className="mt-3 inline-block text-sm font-semibold text-brand">
          Back to Browse Opportunities
        </Link>
      </div>
    )
  }

  const saved = isSaved(o.id)

  async function shareOpportunity() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: o.title, text: `${o.title} at ${o.company}`, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareMessage('Link copied to clipboard.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareMessage('Unable to share this opportunity from your browser.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6">
      <section className="relative flex h-44 items-end overflow-hidden rounded-2xl bg-navy/80 p-6 sm:h-48 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0, transparent 45%)' }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-4 sm:gap-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white font-display text-2xl font-bold text-navy sm:size-16 sm:text-3xl">
            {o.company[0]}
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl font-bold text-white sm:text-2xl">{o.company}</p>
            <p className="mt-1 text-sm text-white/50">{o.tagline}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-black sm:text-2xl">{o.title}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500">{o.location}</span>
            <span className="size-1 rounded-full bg-gray-500" aria-hidden="true" />
            <span className="font-semibold text-brand">{o.type}</span>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-gray-500">Application Deadline</p>
          <p className="mt-1 text-sm font-bold text-black">{o.deadline}</p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <article className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 sm:p-8">
          <section>
            <h3 className="font-display text-lg font-bold text-black">Role Overview</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">{o.overview}</p>
          </section>

          <section>
            <h3 className="font-display text-lg font-bold text-black">Key Requirements</h3>
            <ul className="mt-3 space-y-2.5">
              {o.requirements.map((requirement) => (
                <li key={requirement} className="flex gap-3 text-sm leading-5 text-gray-500">
                  <span className="shrink-0 text-brand" aria-hidden="true">•</span>
                  {requirement}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-display text-lg font-bold text-black">Benefits</h3>
            <ul className="mt-3 space-y-2.5">
              {o.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-3 text-sm leading-5 text-gray-500">
                  <span className="shrink-0 text-brand" aria-hidden="true">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="space-y-5">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            {/* TODO: connect this action to the application submission service. */}
            <Button className="w-full rounded-lg py-3.5">Apply Now</Button>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => toggleSaved(o.id)}
                aria-pressed={saved}
                className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                  saved ? 'border-brand bg-amber-50 text-amber-700' : 'border-neutral-200 text-navy hover:bg-slate-50'
                }`}
              >
                <BookmarkIcon filled={saved} className="size-4" /> {saved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={shareOpportunity}
                className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-3 text-sm font-semibold text-navy hover:bg-slate-50"
              >
                <Icon name="share" className="size-4" /> Share
              </button>
            </div>
            {shareMessage && <p role="status" className="mt-3 text-center text-xs text-gray-500">{shareMessage}</p>}
          </section>

          <MatchBreakdownChart overall={o.fit} items={o.matchBreakdown} />
        </aside>
      </div>
    </div>
  )
}
