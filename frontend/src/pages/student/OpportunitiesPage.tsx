/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FiltersPanel from '../../components/opportunities/FiltersPanel'
import OpportunityListCard from '../../components/opportunities/OpportunityListCard'
import type { Opportunity } from '../../types/student'
import type { OpportunityType } from '../../types/opportunity'
import { opportunityService } from '../../services/opportunityService'
import { toStudentOpportunitySearch } from '../../utils/opportunityPresentation'

const OPPORTUNITY_TYPES: readonly OpportunityType[] = [
  'INTERNSHIP', 'JOB', 'SCHOLARSHIP', 'HACKATHON', 'COMPETITION', 'TRAINING', 'VOLUNTEER', 'FELLOWSHIP', 'OTHER',
]

export default function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') ?? '')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [academicYear, setAcademicYear] = useState('')
  const [skill, setSkill] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [items, setItems] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      if (query.trim()) next.set('search', query.trim())
      else next.delete('search')
      if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true })
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [query, searchParams, setSearchParams])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    opportunityService.listOpportunities({
      search: query.trim(),
      location,
      remote: remoteOnly ? 'remote' : undefined,
      field: selectedFields.length === 1 ? selectedFields[0] : undefined,
      type: selectedTypes.length === 1
        ? OPPORTUNITY_TYPES.find((type) => type === selectedTypes[0])
        : undefined,
      academicYear: academicYear ? Number(academicYear) : undefined,
      skills: skill.trim(),
    }).then((result) => {
      if (active) setItems(result.map(toStudentOpportunitySearch))
    }).catch(() => {
      if (active) setError('Unable to load opportunities. Please try again.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [academicYear, location, query, remoteOnly, selectedFields, selectedTypes, skill, reloadKey])

  const opportunities = useMemo(() => items.filter((opportunity) => {
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(opportunity.type)
      const matchesFields = selectedFields.length === 0 ||
        selectedFields.some((field) => opportunity.fieldsOfStudy?.includes(field))
      return matchesType && matchesFields
    }), [items, selectedFields, selectedTypes])

  function updateSelection(values: string[], value: string, checked: boolean) {
    return checked ? [...values, value] : values.filter((entry) => entry !== value)
  }

  function resetFilters() {
    setSelectedTypes([])
    setSelectedFields([])
    setLocation('')
    setRemoteOnly(false)
    setAcademicYear('')
    setSkill('')
    setQuery('')
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] lg:flex lg:items-start lg:gap-6">
      <FiltersPanel
        selectedTypes={selectedTypes}
        selectedFields={selectedFields}
        location={location}
        remote={remoteOnly}
        academicYear={academicYear}
        skill={skill}
        onTypeChange={(type, checked) => setSelectedTypes((current) => updateSelection(current, type, checked))}
        onFieldChange={(field, checked) => setSelectedFields((current) => updateSelection(current, field, checked))}
        onLocationChange={setLocation}
        onRemoteChange={setRemoteOnly}
        onAcademicYearChange={setAcademicYear}
        onSkillChange={setSkill}
        onReset={resetFilters}
      />
      <div className="mt-6 min-w-0 flex-1 lg:mt-0">
        <form role="search" onSubmit={(event) => event.preventDefault()} className="mb-5">
          <label className="block">
            <span className="sr-only">Search opportunities</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search opportunities, organizations, or skills"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500" aria-live="polite">
            {loading ? 'Loading opportunities…' : <>Showing <span className="font-bold text-black">{opportunities.length} {opportunities.length === 1 ? 'result' : 'results'}</span> matching your search</>}
          </p>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-white p-8 text-center">
            <p role="alert" className="text-sm text-red-700">{error}</p>
            <button type="button" onClick={() => setReloadKey((current) => current + 1)} className="mt-3 text-sm font-semibold text-brand hover:underline">
              Retry loading
            </button>
          </div>
        ) : loading ? (
          <div className="mt-5 space-y-4" aria-busy="true">
            {[0, 1, 2].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl border border-neutral-200 bg-white" />)}
          </div>
        ) : opportunities.length > 0 ? (
          <div className="mt-5 space-y-5">
            {opportunities.map((opportunity) => (
              <OpportunityListCard key={opportunity.id} o={opportunity} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-8 text-center">
            <p className="font-semibold text-black">No opportunities match these filters.</p>
            <button type="button" onClick={resetFilters} className="mt-2 text-sm font-semibold text-brand hover:underline">
              Clear search and filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
