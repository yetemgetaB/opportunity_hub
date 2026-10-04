import { useMemo, useState } from 'react'
import FiltersPanel from '../../components/opportunities/FiltersPanel'
import OpportunityListCard from '../../components/opportunities/OpportunityListCard'
import { OPPORTUNITIES } from '../../utils/studentData'

type SortOrder = 'match' | 'deadline'

export default function OpportunitiesPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [sortBy, setSortBy] = useState<SortOrder>('match')

  const opportunities = useMemo(() => {
    const filtered = OPPORTUNITIES.filter((opportunity) => {
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(opportunity.type)
      const matchesField =
        selectedFields.length === 0 ||
        selectedFields.some((field) => opportunity.fieldsOfStudy?.includes(field))
      const matchesLocation = !location.trim() || opportunity.location.toLowerCase().includes(location.trim().toLowerCase())
      return matchesType && matchesField && matchesLocation
    })

    return [...filtered].sort((a, b) =>
      sortBy === 'match'
        ? b.fit - a.fit
        : new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
  }, [location, selectedFields, selectedTypes, sortBy])

  function updateSelection(values: string[], value: string, checked: boolean) {
    return checked ? [...values, value] : values.filter((entry) => entry !== value)
  }

  function resetFilters() {
    setSelectedTypes([])
    setSelectedFields([])
    setLocation('')
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] lg:flex lg:items-start lg:gap-6">
      <FiltersPanel
        selectedTypes={selectedTypes}
        selectedFields={selectedFields}
        location={location}
        onTypeChange={(type, checked) => setSelectedTypes((current) => updateSelection(current, type, checked))}
        onFieldChange={(field, checked) => setSelectedFields((current) => updateSelection(current, field, checked))}
        onLocationChange={setLocation}
        onReset={resetFilters}
      />
      <div className="mt-6 min-w-0 flex-1 lg:mt-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            Showing{' '}
            <span className="font-bold text-black">
              {opportunities.length} {opportunities.length === 1 ? 'result' : 'results'}
            </span>{' '}
            matching your profile
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-500">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.currentTarget.value === 'deadline' ? 'deadline' : 'match')}
              className="max-w-44 bg-transparent font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="match">Best Match Score</option>
              <option value="deadline">Closing Soon</option>
            </select>
          </label>
        </div>

        {opportunities.length > 0 ? (
          <div className="mt-5 space-y-5">
            {opportunities.map((opportunity) => (
              <OpportunityListCard key={opportunity.id} o={opportunity} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-8 text-center">
            <p className="font-semibold text-black">No opportunities match these filters.</p>
            <button type="button" onClick={resetFilters} className="mt-2 text-sm font-semibold text-brand hover:underline">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
