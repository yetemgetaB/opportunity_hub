import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { opportunityService, type OpportunityCreatePayload } from '../../services/opportunityService'
import type { OpportunityType } from '../../types/opportunity'

const types: { value: OpportunityType; label: string }[] = [
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'JOB', label: 'Job' },
  { value: 'SCHOLARSHIP', label: 'Scholarship' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'COMPETITION', label: 'Competition' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'VOLUNTEER', label: 'Volunteer' },
  { value: 'FELLOWSHIP', label: 'Fellowship' },
  { value: 'OTHER', label: 'Other' },
]

const fieldClass = 'mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'

export default function CreateOpportunityPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const typeValue = String(form.get('opportunityType') ?? '')
    const selectedType = types.find((type) => type.value === typeValue)
    if (!selectedType) {
      setError('Choose a valid opportunity type.')
      return
    }
    const minYear = String(form.get('minimumAcademicYear') ?? '')
    const maxYear = String(form.get('maximumAcademicYear') ?? '')
    const minGpa = String(form.get('minimumGpa') ?? '')
    const deadline = String(form.get('applicationDeadline') ?? '')
    const payload: OpportunityCreatePayload = {
      title: String(form.get('title') ?? '').trim(),
      description: String(form.get('description') ?? '').trim(),
      opportunityType: selectedType.value,
      location: String(form.get('location') ?? '').trim() || null,
      isRemote: form.get('isRemote') === 'on',
      applicationDeadline: deadline ? `${deadline}T23:59:59.999Z` : null,
      eligibleFields: String(form.get('eligibleFields') ?? '').split(',').map((field) => field.trim()).filter(Boolean),
      minimumAcademicYear: minYear ? Number(minYear) : null,
      maximumAcademicYear: maxYear ? Number(maxYear) : null,
      minimumGpa: minGpa ? Number(minGpa) : null,
      compensation: String(form.get('compensation') ?? '').trim() || null,
      applicationUrl: String(form.get('applicationUrl') ?? '').trim() || null,
    }
    setSubmitting(true)
    setError('')
    try {
      await opportunityService.createOpportunity(payload)
      navigate('/organization/opportunities', {
        replace: true,
        state: { notice: 'Draft created. Review it in your opportunity history and publish it when ready.', tab: 'history' },
      })
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Unable to create the opportunity.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold text-slate-900">Create an Opportunity</h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          Create a draft using fields supported by the current API. Skills require backend skill IDs and are omitted because no skill catalog endpoint is available.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-7">
        <div>
          <label htmlFor="opportunity-title" className="text-sm font-semibold text-slate-800">Opportunity title</label>
          <input id="opportunity-title" name="title" className={fieldClass} maxLength={180} required />
        </div>
        <div>
          <label htmlFor="opportunity-type" className="text-sm font-semibold text-slate-800">Type</label>
          <select id="opportunity-type" name="opportunityType" className={fieldClass} required defaultValue="">
            <option value="" disabled>Select type</option>
            {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="opportunity-description" className="text-sm font-semibold text-slate-800">Description</label>
          <textarea id="opportunity-description" name="description" className={fieldClass} rows={6} required />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">
            Location
            <input name="location" className={fieldClass} />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Application deadline
            <input name="applicationDeadline" type="date" className={fieldClass} />
          </label>
          <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
            Eligible fields <span className="font-normal text-slate-500">(comma separated)</span>
            <input name="eligibleFields" className={fieldClass} />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Minimum academic year
            <input name="minimumAcademicYear" type="number" min="1" className={fieldClass} />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Maximum academic year
            <input name="maximumAcademicYear" type="number" min="1" className={fieldClass} />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Minimum GPA
            <input name="minimumGpa" type="number" min="0" max="9.99" step="0.01" className={fieldClass} />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Compensation
            <input name="compensation" className={fieldClass} />
          </label>
          <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
            Application URL <span className="font-normal text-slate-500">(optional)</span>
            <input name="applicationUrl" type="url" className={fieldClass} />
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-700 sm:col-span-2">
            <input name="isRemote" type="checkbox" className="size-4 accent-brand" />
            This opportunity is remote
          </label>
        </div>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end border-t border-slate-100 pt-5">
          <Button type="submit" disabled={submitting} className="w-full rounded-lg px-6 py-3 font-bold disabled:opacity-60 sm:w-auto">
            {submitting ? 'Saving draft…' : 'Save Draft'}
          </Button>
        </div>
      </form>
    </div>
  )
}
