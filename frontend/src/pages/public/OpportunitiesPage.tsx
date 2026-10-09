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

  const activeFiltersCount = [
    filters.type,
    filters.location,
    filters.remote,
    filters.field,
    filters.academicYear,
    filters.skills,
  ].filter(Boolean).length

  return (
    <aside className="sticky top-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all" aria-label="Filter opportunities">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-base font-bold text-navy">Filters</h2>
          {activeFiltersCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button type="button" onClick={onClear} className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline">
            Reset all
          </button>
        )}
      </div>
      <div className="space-y-4 text-xs">
        <label className="block">
          <span className="mb-1.5 block font-bold text-slate-700 uppercase tracking-wider text-[11px]">Opportunity Type</span>
          <select
            value={filters.type ?? ''}
            onChange={(event) => onChange({ ...filters, type: (event.target.value || undefined) as OpportunityType | undefined })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">All Opportunity Types</option>
            {opportunityTypes.map((type) => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-bold text-slate-700 uppercase tracking-wider text-[11px]">Workplace Setup</span>
          <select
            value={filters.remote ?? ''}
            onChange={(event) => onChange({
              ...filters,
              remote: (event.target.value || undefined) as OpportunityFilters['remote'],
            })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Any (Remote or On-site)</option>
            <option value="remote">Remote Only</option>
            <option value="onsite">On-site / Hybrid</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-bold text-slate-700 uppercase tracking-wider text-[11px]">Location</span>
          <input
            value={filters.location ?? ''}
            onChange={(event) => changeText('location', event)}
            placeholder="e.g. Addis Ababa, Remote"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-bold text-slate-700 uppercase tracking-wider text-[11px]">Field of Study</span>
          <input
            value={filters.field ?? ''}
            onChange={(event) => changeText('field', event)}
            placeholder="e.g. Computer Science"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-bold text-slate-700 uppercase tracking-wider text-[11px]">Academic Year</span>
          <select
            value={filters.academicYear ?? ''}
            onChange={(event) => onChange({
              ...filters,
              academicYear: event.target.value ? Number(event.target.value) : undefined,
            })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">Any Academic Year</option>
            {[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>Year {year}</option>)}
          </select>
        </label>
      </div>
    </aside>
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

const QUICK_SKILLS = ['Python', 'React', 'TypeScript', 'Node.js', 'Docker', 'PostgreSQL', 'UI/UX Design', 'Machine Learning', 'Flutter']

export default function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''
  const initialSkills = searchParams.get('skills') ?? ''
  const [filters, setFilters] = useState<OpportunityFilters>(() => ({
    ...emptyFilters,
    skills: initialSkills || undefined,
  }))
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch.trim())
  const [opportunities, setOpportunities] = useState<OpportunitySearchResult[]>([])
  const [total, setTotal] = useState<number>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Sync incoming URL search and skills changes
  useEffect(() => {
    const urlSkills = searchParams.get('skills') ?? ''
    if (urlSkills !== (filters.skills ?? '')) {
      setFilters((prev) => ({ ...prev, skills: urlSkills || undefined }))
    }
  }, [searchParams])

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (debouncedSearch) next.set('search', debouncedSearch)
    else next.delete('search')
    if (filters.skills) next.set('skills', filters.skills)
    else next.delete('skills')
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true })
    }
  }, [debouncedSearch, filters.skills, searchParams, setSearchParams])

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
      <main className="min-h-[70vh] bg-slate-50/70 pb-16">
        {/* Futuristic Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-navy via-navy to-navy-light px-5 py-14 sm:px-8 sm:py-18 lg:px-10 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 75% 20%, #f5a623 0, transparent 40%)' }}
            aria-hidden="true"
          />
          <div className="mx-auto max-w-7xl relative">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 border border-white/15 backdrop-blur-xs">
                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                Verified Opportunities
              </span>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl leading-tight">
                Discover Your Next Opportunity
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Explore curated internships, scholarships, fellowships, and full-time roles directly from verified industry leaders and organizations.
              </p>
            </div>

            {/* Glowing Search Bar */}
            <form
              onSubmit={(event) => event.preventDefault()}
              className="mt-8 flex min-h-14 items-center gap-3 rounded-2xl border border-white/20 bg-white/95 backdrop-blur-md px-4 shadow-xl transition-all focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/20"
              role="search"
            >
              <Icon name="search" className="size-5 shrink-0 text-slate-400" />
              <label className="min-w-0 flex-1">
                <span className="sr-only">Search opportunities</span>
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by role title, company, skills, or location…"
                  className="w-full bg-transparent py-4 text-sm font-medium text-navy outline-none placeholder:text-slate-400"
                />
              </label>
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="rounded-lg p-1 text-slate-400 hover:text-navy transition"
                  aria-label="Clear search"
                >
                  <Icon name="x" className="size-4" />
                </button>
              )}
            </form>

            {/* Popular Skill Filters */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-300 mr-1">Trending Skills:</span>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, skills: undefined }))}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  !filters.skills
                    ? 'bg-amber-400 text-navy shadow-xs'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                }`}
              >
                All Skills
              </button>
              {QUICK_SKILLS.map((skill) => {
                const active = filters.skills?.toLowerCase() === skill.toLowerCase()
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, skills: active ? undefined : skill }))}
                    className={`rounded-full px-3 py-1 font-medium transition ${
                      active
                        ? 'bg-amber-400 text-navy font-bold shadow-xs'
                        : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                    }`}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 mt-6">

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
