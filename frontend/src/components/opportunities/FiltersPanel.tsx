import { FIELDS_OF_STUDY } from '../../utils/studentData'

type Props = {
  selectedTypes: string[]
  selectedFields: string[]
  location: string
  remote: boolean
  academicYear: string
  skill: string
  onTypeChange: (type: string, checked: boolean) => void
  onFieldChange: (field: string, checked: boolean) => void
  onLocationChange: (location: string) => void
  onRemoteChange: (remote: boolean) => void
  onAcademicYearChange: (year: string) => void
  onSkillChange: (skill: string) => void
  onReset: () => void
}

const JOB_TYPE_OPTIONS = [
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Job', value: 'JOB' },
  { label: 'Scholarship', value: 'SCHOLARSHIP' },
  { label: 'Hackathon', value: 'HACKATHON' },
  { label: 'Competition', value: 'COMPETITION' },
  { label: 'Training', value: 'TRAINING' },
  { label: 'Volunteer', value: 'VOLUNTEER' },
  { label: 'Fellowship', value: 'FELLOWSHIP' },
  { label: 'Other', value: 'OTHER' },
]

export default function FiltersPanel({
  selectedTypes,
  selectedFields,
  location,
  remote,
  academicYear,
  skill,
  onTypeChange,
  onFieldChange,
  onLocationChange,
  onRemoteChange,
  onAcademicYearChange,
  onSkillChange,
  onReset,
}: Props) {
  return (
    <aside className="h-fit w-full shrink-0 rounded-xl border border-neutral-200 bg-white p-5 lg:w-72">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-black">Filters</h2>
        <button type="button" onClick={onReset} className="text-xs font-semibold text-brand hover:underline">
          Clear all
        </button>
      </div>

      <div className="mt-5 border-b border-neutral-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Opportunity Type</p>
        <div className="mt-3 space-y-3">
          {JOB_TYPE_OPTIONS.map(({ label, value }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm text-black">
              <input
                type="checkbox"
                checked={selectedTypes.includes(value)}
                onChange={(event) => onTypeChange(value, event.target.checked)}
                className="size-4 accent-brand"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 border-b border-neutral-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Field of Study</p>
        <div className="mt-3 space-y-3">
          {FIELDS_OF_STUDY.map((field) => (
            <label key={field} className="flex cursor-pointer items-center gap-2.5 text-sm text-black">
              <input
                type="checkbox"
                checked={selectedFields.includes(field)}
                onChange={(event) => onFieldChange(field, event.target.checked)}
                className="size-4 accent-brand"
              />
              {field}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="opportunity-location" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Location
        </label>
        <input
          id="opportunity-location"
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          placeholder="Any location"
          className="mt-2.5 w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm text-black outline-none placeholder:text-gray-500 focus:border-brand"
        />
      </div>

      <div className="mt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-black">
          <input
            type="checkbox"
            checked={remote}
            onChange={(event) => onRemoteChange(event.target.checked)}
            className="size-4 accent-brand"
          />
          Remote opportunities
        </label>
      </div>

      <div className="mt-5">
        <label htmlFor="opportunity-academic-year" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Academic year
        </label>
        <select
          id="opportunity-academic-year"
          value={academicYear}
          onChange={(event) => onAcademicYearChange(event.target.value)}
          className="mt-2.5 w-full rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-brand"
        >
          <option value="">Any year</option>
          {[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>Year {year}</option>)}
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="opportunity-skill" className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Skill
        </label>
        <input
          id="opportunity-skill"
          value={skill}
          onChange={(event) => onSkillChange(event.target.value)}
          placeholder="e.g. Python"
          className="mt-2.5 w-full rounded-md border border-neutral-200 px-3 py-2.5 text-sm text-black outline-none placeholder:text-gray-500 focus:border-brand"
        />
      </div>
    </aside>
  )
}
