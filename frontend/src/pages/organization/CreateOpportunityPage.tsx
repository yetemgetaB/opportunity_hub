import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { opportunityService, type OpportunityCreatePayload } from '../../services/opportunityService'
import { skillService, type SkillItem } from '../../services/skillService'
import { FIELDS_OF_STUDY } from '../../utils/studentData'
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

const fieldClass = 'mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'

export default function CreateOpportunityPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [allSkills, setAllSkills] = useState<SkillItem[]>([])
  const [selectedSkills, setSelectedSkills] = useState<{ skillId: string; requirementLevel: 'REQUIRED' | 'PREFERRED' }[]>([])
  const [pickerSkillId, setPickerSkillId] = useState('')
  const [pickerLevel, setPickerLevel] = useState<'REQUIRED' | 'PREFERRED'>('REQUIRED')

  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [customFieldInput, setCustomFieldInput] = useState('')

  useEffect(() => {
    skillService.listAll().then(setAllSkills).catch(() => {})
  }, [])

  function addSkill() {
    if (!pickerSkillId) return
    if (selectedSkills.some((s) => s.skillId === pickerSkillId)) return
    setSelectedSkills((prev) => [...prev, { skillId: pickerSkillId, requirementLevel: pickerLevel }])
    setPickerSkillId('')
  }

  function removeSkill(id: string) {
    setSelectedSkills((prev) => prev.filter((s) => s.skillId !== id))
  }

  function toggleField(field: string) {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  function addCustomField() {
    const trimmed = customFieldInput.trim()
    if (!trimmed) return
    if (!selectedFields.includes(trimmed)) {
      setSelectedFields((prev) => [...prev, trimmed])
    }
    setCustomFieldInput('')
  }

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
      eligibleFields: selectedFields,
      minimumAcademicYear: minYear ? Number(minYear) : null,
      maximumAcademicYear: maxYear ? Number(maxYear) : null,
      minimumGpa: minGpa ? Number(minGpa) : null,
      compensation: String(form.get('compensation') ?? '').trim() || null,
      applicationUrl: String(form.get('applicationUrl') ?? '').trim() || null,
      skills: selectedSkills,
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

  const unselectedSkills = allSkills.filter((s) => !selectedSkills.some((sel) => sel.skillId === s.id))

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold text-slate-900">Create an Opportunity</h1>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">
          Post an internship, job, scholarship, or fellowship. Tag required and preferred skills to enable automated student matching.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-sm">
        <div>
          <label htmlFor="opportunity-title" className="text-sm font-semibold text-slate-800">Opportunity title</label>
          <input id="opportunity-title" name="title" className={fieldClass} maxLength={180} required placeholder="e.g. Software Engineering Intern" />
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
          <textarea id="opportunity-description" name="description" className={fieldClass} rows={5} required placeholder="Describe responsibilities, team culture, and requirements..." />
        </div>

        {/* Skills Tagging Section */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-navy mb-1">Target Skills & Requirements</h2>
          <p className="text-xs text-slate-500 mb-3">Tag the skills students should have for optimal AI matching.</p>

          {/* Current Selected Skill Pills */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSkills.map((sel) => {
                const skillObj = allSkills.find((s) => s.id === sel.skillId)
                return (
                  <span
                    key={sel.skillId}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border shadow-xs ${
                      sel.requirementLevel === 'REQUIRED'
                        ? 'bg-amber-100/90 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    <span className="font-semibold">{skillObj?.name ?? sel.skillId}</span>
                    <span className="text-[10px] uppercase font-bold opacity-75">({sel.requirementLevel.toLowerCase()})</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(sel.skillId)}
                      className="ml-1 text-slate-400 hover:text-red-600 focus:outline-none"
                    >
                      <Icon name="close" className="size-3" />
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {/* Add Skill Control */}
          <div className="flex flex-wrap gap-2">
            <select
              value={pickerSkillId}
              onChange={(e) => setPickerSkillId(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
            >
              <option value="">Select a skill to add…</option>
              {unselectedSkills.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
            <select
              value={pickerLevel}
              onChange={(e) => setPickerLevel(e.target.value as 'REQUIRED' | 'PREFERRED')}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
            >
              <option value="REQUIRED">Required</option>
              <option value="PREFERRED">Preferred</option>
            </select>
            <button
              type="button"
              disabled={!pickerSkillId}
              onClick={addSkill}
              className="rounded-lg bg-navy px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              Add Tag
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-800">
            Location
            <input name="location" className={fieldClass} placeholder="e.g. Addis Ababa / Remote" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Application deadline
            <input name="applicationDeadline" type="date" className={fieldClass} />
          </label>
          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-navy">Eligible Fields of Study</label>
              <span className="text-xs text-slate-500">
                {selectedFields.length === 0 ? 'Open to all fields' : `${selectedFields.length} selected`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Select predefined fields or add custom fields to target students from specific departments.
            </p>

            {/* Selected Field Pills */}
            {selectedFields.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3.5">
                {selectedFields.map((field) => (
                  <span
                    key={field}
                    className="inline-flex items-center gap-1.5 rounded-full bg-navy text-white px-3 py-1 text-xs font-medium shadow-xs"
                  >
                    <span>{field}</span>
                    <button
                      type="button"
                      onClick={() => toggleField(field)}
                      className="ml-0.5 text-slate-300 hover:text-red-400 focus:outline-none"
                    >
                      <Icon name="close" className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Pick Predefined Pills */}
            <div className="mb-3">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Popular Academic Disciplines
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {FIELDS_OF_STUDY.map((field) => {
                  const isSelected = selectedFields.includes(field)
                  return (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleField(field)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition cursor-pointer border ${
                        isSelected
                          ? 'border-navy bg-navy/10 text-navy font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {field}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add Custom Field */}
            <div className="flex gap-2 pt-1 border-t border-slate-200/80">
              <input
                type="text"
                value={customFieldInput}
                onChange={(e) => setCustomFieldInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomField()
                  }
                }}
                placeholder="Or add another field (e.g. Architecture, Pharmacy)..."
                className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={addCustomField}
                disabled={!customFieldInput.trim()}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
              >
                Add Field
              </button>
            </div>
          </div>
          <label className="text-sm font-semibold text-slate-800">
            Minimum academic year
            <input name="minimumAcademicYear" type="number" min="1" max="6" className={fieldClass} placeholder="e.g. 3" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Maximum academic year
            <input name="maximumAcademicYear" type="number" min="1" max="6" className={fieldClass} placeholder="e.g. 5" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Minimum GPA
            <input name="minimumGpa" type="number" min="0" max="9.99" step="0.01" className={fieldClass} placeholder="e.g. 3.2" />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Compensation
            <input name="compensation" className={fieldClass} placeholder="e.g. ETB 18,000 / month" />
          </label>
          <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
            Application URL <span className="font-normal text-slate-500">(optional)</span>
            <input name="applicationUrl" type="url" className={fieldClass} placeholder="https://..." />
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-700 sm:col-span-2">
            <input name="isRemote" type="checkbox" className="size-4 accent-amber-500" />
            This opportunity is remote-friendly
          </label>
        </div>

        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end border-t border-slate-100 pt-5">
          <Button type="submit" disabled={submitting} className="w-full rounded-lg px-6 py-3 font-bold disabled:opacity-60 sm:w-auto">
            {submitting ? 'Saving draft…' : 'Save Opportunity Draft'}
          </Button>
        </div>
      </form>
    </div>
  )
}
