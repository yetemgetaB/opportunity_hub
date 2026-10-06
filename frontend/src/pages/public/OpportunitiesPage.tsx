/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import Footer from '../../components/layout/Footer'
import Navbar from '../../components/layout/Navbar'
import OpportunityCard from '../../components/opportunities/OpportunityCard'
import Icon from '../../components/ui/Icon'
import { useSearchParams } from 'react-router-dom'
import type { OpportunityFilters, OpportunitySearchResult, OpportunityType } from '../../types/opportunity'
import { listOpportunities } from '../../services/opportunityService'

const opportunityTypes: OpportunityType[] = [
  'INTERNSHIP',
  'JOB',
  'SCHOLARSHIP',
  'HACKATHON',
  'COMPETITION',
  'TRAINING',
  'VOLUNTEER',
  'FELLOWSHIP',
  'OTHER',
]

const emptyFilters: OpportunityFilters = {}

type FilterPanelProps = {
  filters: OpportunityFilters
  onChange: (next: OpportunityFilters) => void
  onClear: () => void
}

function FilterPanel({ filters, onChange, onClear }: FilterPanelProps) {
  function changeText(key: 'location' | 'field' | 'skills', event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...filters, [key]: event.target.value || undefined })
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5" aria-label="Filter opportunities">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-navy">Filters</h2>
        <button type="button" onClick={onClear} className="text-xs font-semibold text-amber-700 hover:underline">
          Clear all
        </button>
      </div>
      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700">Opportunity type</span>
          <select
            value={filters.type ?? ''}
            onChange={(event) => onChange({ ...filters, type: (event.target.value || undefined) as OpportunityType | undefined })}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">All types</option>
            {opportunityTypes.map((type) => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700">Location</span>
          <input
            value={filters.location ?? ''}
            onChange={(event) => changeText('location', event)}
            placeholder="City, state, or country"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700">Workplace</span>
          <select
            value={filters.remote ?? ''}
            onChange={(event) => onChange({
              ...filters,
              remote: (event.target.value || undefined) as OpportunityFilters['remote'],
            })}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Remote and on-site</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site or hybrid</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700">Field of study</span>
          <input
            value={filters.field ?? ''}
            onChange={(event) => changeText('field', event)}
            placeholder="e.g. Computer Science"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700">Academic year</span>
          <select
            value={filters.academicYear ?? ''}
            onChange={(event) => onChange({
              ...filters,
              academicYear: event.target.value ? Number(event.target.value) : undefined,
            })}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Any year</option>
            {[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>Year {year}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-slate-700">Skills</span>
          <input
            value={filters.skills ?? ''}
            onChange={(event) => changeText('skills', event)}
            placeholder="e.g. Python, research"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </label>
      </div>
    </section>
  )
}

function OpportunitySkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-6" aria-hidden="true">
      <div className="h-5 w-28 rounded bg-slate-100" />
      <div className="mt-5 h-6 w-3/4 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-1/3 rounded bg-slate-100" />
      <div className="mt-5 h-4 w-full rounded bg-slate-100" />
      <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
      <div className="mt-6 h-4 w-1/2 rounded bg-slate-100" />
    </div>
  )
}

export default function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''
  const [filters, setFilters] = useState<OpportunityFilters>(emptyFilters)
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch.trim())
  const [opportunities, setOpportunities] = useState<OpportunitySearchResult[]>([])
  const [total, setTotal] = useState<number>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    if ((searchParams.get('search') ?? '') === debouncedSearch) return
    const next = new URLSearchParams(searchParams)
    if (debouncedSearch) next.set('search', debouncedSearch)
    else next.delete('search')
    setSearchParams(next, { replace: true })
  }, [debouncedSearch, searchParams, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)

    listOpportunities({ ...filters, search: debouncedSearch || undefined }, controller.signal)
      .then((result) => {
        setOpportunities(result)
        setTotal(result.length)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setOpportunities([])
        setTotal(undefined)
        setError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [filters, debouncedSearch, reloadKey])

  function clearFilters() {
    setFilters(emptyFilters)
    setSearchInput('')
    setDebouncedSearch('')
    setSearchParams({}, { replace: true })
  }

  const filterPanel = (
    <FilterPanel filters={filters} onChange={setFilters} onClear={clearFilters} />
  )

  return (
    <>
      <Navbar />
      <main className="min-h-[65vh] bg-slate-50 px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Explore your next step</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Find opportunities that fit your future
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Search internships, scholarships, jobs, and programs shared by organizations.
            </p>
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
            className="mt-8 flex min-h-14 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 shadow-sm focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20"
            role="search"
          >
            <Icon name="search" className="size-5 shrink-0 text-slate-400" />
            <label className="min-w-0 flex-1">
              <span className="sr-only">Search opportunities</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search titles, organizations, descriptions, or skills"
                className="w-full bg-transparent py-4 text-sm text-navy outline-none placeholder:text-slate-400"
              />
            </label>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-expanded={mobileFiltersOpen}
                aria-controls="public-opportunity-filters"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy lg:hidden"
              >
                <Icon name="settings" className="size-4" />
                {mobileFiltersOpen ? 'Hide filters' : 'Filters'}
              </button>
              <p className="text-sm text-slate-600" aria-live="polite">
                {loading ? 'Loading opportunities…' : `${total ?? opportunities.length} opportunities`}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div id="public-opportunity-filters" className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
              {filterPanel}
            </div>
            <section className="min-w-0" aria-label="Opportunity results" aria-busy={loading}>
              {error ? (
                <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                  <Icon name="alertTriangle" className="mx-auto size-8 text-red-600" />
                  <h2 className="mt-4 font-display text-lg font-bold text-navy">Opportunities couldn’t be loaded</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The opportunity service is unavailable right now. Please try again.
                  </p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((key) => key + 1)}
                    className="mt-5 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-950"
                  >
                    Try again
                  </button>
                </div>
              ) : loading ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {[0, 1, 2, 3].map((item) => <OpportunitySkeleton key={item} />)}
                </div>
              ) : opportunities.length === 0 ? (
                <div className="rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center">
                  <Icon name="search" className="mx-auto size-8 text-slate-400" />
                  <h2 className="mt-4 font-display text-lg font-bold text-navy">No opportunities found</h2>
                  <p className="mt-2 text-sm text-slate-600">Try changing your search or clearing the filters.</p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 text-sm font-semibold text-amber-700 hover:underline"
                  >
                    Clear search and filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {opportunities.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} o={opportunity} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
