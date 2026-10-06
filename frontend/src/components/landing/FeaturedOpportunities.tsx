/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { opportunityService } from '../../services/opportunityService'
import type { OpportunitySearchResult } from '../../types/opportunity'

export default function FeaturedOpportunities() {
  const [opportunities, setOpportunities] = useState<OpportunitySearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    opportunityService.listOpportunities({}, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setOpportunities(result.slice(0, 4))
          setError('')
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Unable to load opportunities.')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [reloadKey])

  return (
    <section id="opportunities" className="border-y border-neutral-200 bg-gray-50 px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-[680px] flex-col items-center gap-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Current Openings</p>
          <h2 className="font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">Featured Opportunities</h2>
          <p className="text-base leading-6 text-gray-500">
            Browse currently published opportunities from participating organizations.
          </p>
        </div>

        {error ? (
          <div className="mx-auto mt-10 max-w-xl rounded-lg border border-red-200 bg-white p-6 text-center">
            <p role="alert" className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-3 text-sm font-semibold text-brand hover:underline">Try again</button>
          </div>
        ) : loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8" aria-busy="true">
            {[0, 1, 2, 3].map((item) => <div key={item} className="h-[285px] animate-pulse rounded-lg border border-gray-300 bg-white" />)}
          </div>
        ) : opportunities.length ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8">
            {opportunities.map((opportunity) => {
              const tags = [...opportunity.skills, ...opportunity.eligibleFields].slice(0, 3)
              return (
                <Link
                  key={opportunity.id}
                  to={`/opportunities/${opportunity.id}`}
                  className="flex h-full min-h-[285px] flex-col gap-5 rounded-lg border border-gray-300 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand/50 hover:shadow-md sm:p-6"
                  aria-label={`View ${opportunity.title}`}
                >
                  <div className="flex flex-col gap-3">
                    <p className="truncate text-xs font-semibold uppercase text-gray-500">{opportunity.opportunityType.replace(/_/g, ' ')}</p>
                    <h3 className="font-display text-xl font-semibold leading-6 text-navy">{opportunity.title}</h3>
                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{opportunity.location ?? (opportunity.isRemote ? 'Remote' : 'Location not specified')}</span>
                      {opportunity.isRemote && opportunity.location ? <span>· Remote</span> : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(tags.length ? tags : [opportunity.isRemote ? 'Remote' : 'Opportunity']).map((tag, index) => (
                      <span key={`${tag}-${index}`} className="rounded-sm border border-neutral-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-navy">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-neutral-200 pt-3 text-xs font-semibold text-navy">
                    <span>View Opportunity</span><span aria-hidden="true">↗</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="mt-10 rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-slate-500">There are no published opportunities to feature right now.</p>
        )}
        <div className="mt-10 flex justify-center">
          <Link to="/opportunities" className="rounded-md bg-navy px-6 py-3.5 text-sm font-semibold !text-brand transition hover:bg-navy-light">
            Explore All Opportunities
          </Link>
        </div>
      </div>
    </section>
  )
}
