import { FIELDS_OF_STUDY } from '../../utils/studentData'

type Props = {
  selectedTypes: string[]
  selectedFields: string[]
  location: string
  onTypeChange: (type: string, checked: boolean) => void
  onFieldChange: (field: string, checked: boolean) => void
  onLocationChange: (location: string) => void
  onReset: () => void
}

const JOB_TYPE_OPTIONS = ['Full-time', 'Internship', 'Co-op']

export default function FiltersPanel({
  selectedTypes,
  selectedFields,
  location,
  onTypeChange,
  onFieldChange,
  onLocationChange,
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
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Job Type</p>
        <div className="mt-3 space-y-3">
          {JOB_TYPE_OPTIONS.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2.5 text-sm text-black">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={(event) => onTypeChange(type, event.target.checked)}
                className="size-4 accent-brand"
              />
              {type}
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
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Experience Level</p>
        <p className="mt-2.5 rounded-md border border-neutral-200 px-3 py-2.5 text-sm text-gray-500">
          Not specified
        </p>
      </div>
    </aside>
  )
}
