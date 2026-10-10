/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OpportunityFormSection } from '../../components/opportunities/OpportunityFormSection'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import Select from '../../components/ui/Select'
import TextField from '../../components/ui/TextField'
import { ApiError } from '../../services/api'
import {
  deleteOrganizationOpportunity,
  getOrganizationOpportunity,
  publishOrganizationOpportunity,
  updateOrganizationOpportunity,
  type OpportunityCreatePayload,
} from '../../services/opportunityService'
import { skillService, type SkillItem } from '../../services/skillService'
import { FIELDS_OF_STUDY } from '../../utils/studentData'
import type {
  OpportunityType,
  OpportunityUpdatePayload,
  OrganizationOpportunity,
} from '../../types/opportunity'

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

type OpportunityForm = {
  title: string
  description: string
  opportunityType: string
  location: string
  isRemote: boolean
  applicationDeadline: string
  eligibleFields: string
  minimumAcademicYear: string
  maximumAcademicYear: string
  minimumGpa: string
  compensation: string
  applicationUrl: string
}

type FormErrors = Partial<Record<keyof OpportunityForm, string>>

const emptyForm: OpportunityForm = {
  title: '',
  description: '',
  opportunityType: '',
  location: '',
  isRemote: false,
  applicationDeadline: '',
  eligibleFields: '',
  minimumAcademicYear: '',
  maximumAcademicYear: '',
  minimumGpa: '',
  compensation: '',
  applicationUrl: '',
}

function dateInputValue(value?: string | null) {
  if (!value) return ''
  const dateOnly = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  if (dateOnly) return dateOnly[1]
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formFromOpportunity(value: OrganizationOpportunity): OpportunityForm {
  return {
    title: value.title ?? '',
    description: value.description ?? '',
    opportunityType: value.opportunityType,
    location: value.location ?? '',
    isRemote: value.isRemote,
    applicationDeadline: dateInputValue(value.applicationDeadline),
    eligibleFields: value.eligibleFields?.join(', ') ?? '',
    minimumAcademicYear: value.minimumAcademicYear?.toString() ?? '',
    maximumAcademicYear: value.maximumAcademicYear?.toString() ?? '',
    minimumGpa: value.minimumGpa?.toString() ?? '',
    compensation: value.compensation ?? '',
    applicationUrl: value.applicationUrl ?? '',
  }
}

function validate(form: OpportunityForm): FormErrors {
  const errors: FormErrors = {}
  if (!form.title.trim()) errors.title = 'Enter an opportunity title.'
  if (!form.description.trim()) errors.description = 'Enter an opportunity description.'
  if (!form.opportunityType) errors.opportunityType = 'Choose an opportunity type.'

  const minimumYear = form.minimumAcademicYear ? Number(form.minimumAcademicYear) : undefined
  const maximumYear = form.maximumAcademicYear ? Number(form.maximumAcademicYear) : undefined
  if (minimumYear !== undefined && (!Number.isInteger(minimumYear) || minimumYear < 1)) {
    errors.minimumAcademicYear = 'Enter a valid academic year.'
  }
  if (maximumYear !== undefined && (!Number.isInteger(maximumYear) || maximumYear < 1)) {
    errors.maximumAcademicYear = 'Enter a valid academic year.'
  }
  if (
    minimumYear !== undefined &&
    maximumYear !== undefined &&
    Number.isInteger(minimumYear) &&
    Number.isInteger(maximumYear) &&
    minimumYear > maximumYear
  ) {
    errors.maximumAcademicYear = 'Maximum year must be at least the minimum year.'
  }
  if (form.minimumGpa && (!Number.isFinite(Number(form.minimumGpa)) || Number(form.minimumGpa) < 0 || Number(form.minimumGpa) > 4)) {
    errors.minimumGpa = 'Enter a GPA between 0 and 4.'
  }
  if (form.applicationUrl) {
    try {
      const url = new URL(form.applicationUrl)
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error()
    } catch {
      errors.applicationUrl = 'Enter a valid URL beginning with https:// or http://.'
    }
  }
  return errors
}

function requestErrorMessage(error: unknown, action: 'load' | 'save' | 'publish' | 'delete') {
  if (error instanceof ApiError && error.status === 0) {
    return 'Unable to reach the service. Check your connection and try again.'
  }
  if (error instanceof ApiError && error.status === 404 && action === 'load') {
    return 'This opportunity could not be found.'
  }
  if (error instanceof ApiError && error.status === 403) {
    return 'You do not have permission to manage this opportunity.'
  }
  if (action === 'load') return 'Unable to load this opportunity.'
  if (action === 'save') return 'Unable to save changes. Please try again.'
  if (action === 'publish') return 'Unable to publish this opportunity. Please try again.'
  return 'Unable to delete this opportunity. Please try again.'
}

function makePayload(form: OpportunityForm, eligibleFields: string[]): OpportunityUpdatePayload {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    opportunityType: form.opportunityType as OpportunityType,
    location: form.location.trim() || null,
    isRemote: form.isRemote,
    applicationDeadline: form.applicationDeadline
      ? `${form.applicationDeadline}T23:59:59.999Z`
      : null,
    eligibleFields,
    minimumAcademicYear: form.minimumAcademicYear ? Number(form.minimumAcademicYear) : null,
    maximumAcademicYear: form.maximumAcademicYear ? Number(form.maximumAcademicYear) : null,
    minimumGpa: form.minimumGpa ? Number(form.minimumGpa) : null,
    compensation: form.compensation.trim() || null,
    applicationUrl: form.applicationUrl.trim() || null,
  }
}

function InlineError({ children }: { children?: string }) {
  return children ? <p role="alert" className="mt-1 text-xs text-red-600">{children}</p> : null
}

export default function EditOpportunityPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [opportunity, setOpportunity] = useState<OrganizationOpportunity>()
  const [form, setForm] = useState<OpportunityForm>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [allSkills, setAllSkills] = useState<SkillItem[]>([])
  const [selectedSkills, setSelectedSkills] = useState<{ skillId: string; requirementLevel: 'REQUIRED' | 'PREFERRED' }[]>([])
  const [pickerSkillId, setPickerSkillId] = useState('')
  const [pickerLevel, setPickerLevel] = useState<'REQUIRED' | 'PREFERRED'>('REQUIRED')

  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [customFieldInput, setCustomFieldInput] = useState('')

  useEffect(() => {
    skillService.listAll().then(setAllSkills).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('This opportunity could not be found.')
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError('')
    setOpportunity(undefined)
    setForm(emptyForm)

    getOrganizationOpportunity(id, controller.signal)
      .then((result) => {
        setOpportunity(result)
        setForm(formFromOpportunity(result))
        setSelectedFields(result.eligibleFields ? [...result.eligibleFields] : [])
        if (result.skills && Array.isArray(result.skills)) {
          setSelectedSkills(
            result.skills.map((s) => ({
              skillId: (s as any).skillId ?? (s as any).skill?.id ?? s.name ?? '',
              requirementLevel: ((s.requirementLevel ?? 'REQUIRED').toUpperCase() === 'PREFERRED' ? 'PREFERRED' : 'REQUIRED') as 'REQUIRED' | 'PREFERRED',
            })).filter((s) => Boolean(s.skillId))
          )
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(requestErrorMessage(cause, 'load'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [id, reloadKey])

  function addSkill() {
    if (!pickerSkillId) return
    if (selectedSkills.some((s) => s.skillId === pickerSkillId)) return
    setSelectedSkills((prev) => [...prev, { skillId: pickerSkillId, requirementLevel: pickerLevel }])
    setPickerSkillId('')
  }

  function removeSkill(skillId: string) {
    setSelectedSkills((prev) => prev.filter((s) => s.skillId !== skillId))
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

  function update<K extends keyof OpportunityForm>(key: K, value: OpportunityForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({ ...current, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return
    const nextErrors = validate(form)
    setFieldErrors(nextErrors)
    setError('')
    setActionError('')
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    try {
      const payload: OpportunityCreatePayload = {
        ...makePayload(form, selectedFields),
        skills: selectedSkills,
      }
      await updateOrganizationOpportunity(id, payload)
      navigate('/organization/opportunities', {
        replace: true,
        state: { notice: 'Opportunity updated successfully.' },
      })
    } catch (cause) {
      setError(requestErrorMessage(cause, 'save'))
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    if (!id) return
    setPublishing(true)
    setActionError('')
    try {
      const result = await publishOrganizationOpportunity(id)
      if (result) setOpportunity(result)
      else setOpportunity((current) => current ? { ...current, status: 'PUBLISHED' } : current)
      setActionError('Opportunity published successfully.')
    } catch (cause) {
      setActionError(requestErrorMessage(cause, 'publish'))
    } finally {
      setPublishing(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    setDeleting(true)
    setActionError('')
    try {
      await deleteOrganizationOpportunity(id)
      navigate('/organization/opportunities', {
        replace: true,
        state: { notice: 'Opportunity deleted.' },
      })
    } catch (cause) {
      setActionError(requestErrorMessage(cause, 'delete'))
      setDeleting(false)
      setDeleteConfirmationOpen(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link
        to="/organization/opportunities"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-navy"
      >
        <span aria-hidden="true">←</span> My Opportunities
      </Link>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold text-slate-900">Edit Opportunity</h1>
        <p className="mt-1.5 text-sm text-gray-500">Update the details students see when they discover this opportunity.</p>
      </header>

      {loading ? (
        <div className="space-y-5" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="animate-pulse rounded-xl border border-neutral-200 bg-white p-8">
              <div className="h-5 w-48 rounded bg-slate-100" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="h-12 rounded bg-slate-100" />
                <div className="h-12 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error && !opportunity ? (
        <section className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <Icon name="alertTriangle" className="mx-auto size-8 text-amber-600" />
          <h2 className="mt-4 font-display text-lg font-bold text-navy">{error}</h2>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</Button>
            <Button to="/organization/opportunities" variant="secondary">Back to opportunities</Button>
          </div>
        </section>
      ) : (
        <>
          {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <OpportunityFormSection icon="info" title="Basic Information">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <TextField
                    label="Opportunity Title"
                    required
                    value={form.title}
                    onChange={(event) => update('title', event.target.value)}
                    aria-invalid={Boolean(fieldErrors.title)}
                  />
                  <InlineError>{fieldErrors.title}</InlineError>
                </div>
                <div>
                  <Select
                    label="Opportunity Type"
                    options={opportunityTypes}
                    value={form.opportunityType}
                    onChange={(event) => update('opportunityType', event.target.value)}
                    className="!h-[46px] !rounded-lg !bg-white !px-4 !py-3"
                  />
                  <InlineError>{fieldErrors.opportunityType}</InlineError>
                </div>
              </div>
              <div>
                <label htmlFor="edit-opportunity-description" className="text-xs font-semibold text-slate-900">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="edit-opportunity-description"
                  required
                  rows={5}
                  value={form.description}
                  onChange={(event) => update('description', event.target.value)}
                  className="mt-2 block w-full resize-y rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <InlineError>{fieldErrors.description}</InlineError>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Location"
                  value={form.location}
                  onChange={(event) => update('location', event.target.value)}
                  placeholder="City, state, or country"
                />
                <TextField
                  label="Application URL"
                  type="url"
                  value={form.applicationUrl}
                  onChange={(event) => update('applicationUrl', event.target.value)}
                  placeholder="https://example.com/apply"
                  aria-invalid={Boolean(fieldErrors.applicationUrl)}
                />
              </div>
              <InlineError>{fieldErrors.applicationUrl}</InlineError>
              <label className="flex min-h-11 items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isRemote}
                  onChange={(event) => update('isRemote', event.target.checked)}
                  className="size-4 accent-amber-500"
                />
                This opportunity is remote
              </label>
            </OpportunityFormSection>

            <OpportunityFormSection icon="check" title="Eligibility & Matching">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
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
                          className="ml-0.5 text-slate-300 hover:text-red-400 focus:outline-none cursor-pointer"
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
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <TextField
                    label="Minimum Academic Year"
                    type="number"
                    min={1}
                    step={1}
                    value={form.minimumAcademicYear}
                    onChange={(event) => update('minimumAcademicYear', event.target.value)}
                  />
                  <InlineError>{fieldErrors.minimumAcademicYear}</InlineError>
                </div>
                <div>
                  <TextField
                    label="Maximum Academic Year"
                    type="number"
                    min={1}
                    step={1}
                    value={form.maximumAcademicYear}
                    onChange={(event) => update('maximumAcademicYear', event.target.value)}
                  />
                  <InlineError>{fieldErrors.maximumAcademicYear}</InlineError>
                </div>
                <div>
                  <TextField
                    label="Minimum GPA"
                    type="number"
                    min={0}
                    max={4}
                    step="0.01"
                    value={form.minimumGpa}
                    onChange={(event) => update('minimumGpa', event.target.value)}
                  />
                  <InlineError>{fieldErrors.minimumGpa}</InlineError>
                </div>
              </div>
            </OpportunityFormSection>

            <OpportunityFormSection icon="check" title="Target Skills & Requirements">
              <p className="text-xs text-slate-500 mb-3">Tag the required and preferred skills students should possess for optimal match rates.</p>

              {/* Current Selected Skill Pills */}
              {selectedSkills.length > 0 ? (
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
              ) : (
                <p className="text-xs text-slate-400 italic mb-3">No specific skills tagged yet.</p>
              )}

              {/* Add Skill Control */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={pickerSkillId}
                  onChange={(e) => setPickerSkillId(e.target.value)}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-amber-500"
                >
                  <option value="">Select a skill to add…</option>
                  {allSkills.filter((s) => !selectedSkills.some((sel) => sel.skillId === s.id)).map((s) => (
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
                  className="rounded-lg bg-navy px-3.5 py-2 text-xs font-semibold !text-white transition hover:bg-slate-800 disabled:opacity-50 dark-button-dark"
                >
                  Add Tag
                </button>
              </div>
            </OpportunityFormSection>

            <OpportunityFormSection icon="calendar" title="Application & Timeline">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Application Deadline"
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(event) => update('applicationDeadline', event.target.value)}
                />
                <TextField
                  label="Compensation"
                  value={form.compensation}
                  onChange={(event) => update('compensation', event.target.value)}
                  placeholder="e.g. $25/hour or stipend provided"
                />
              </div>
            </OpportunityFormSection>

            <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Current status: <span className="font-semibold text-slate-700">{opportunity?.status.replace(/_/g, ' ')}</span>
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button to="/organization/opportunities" variant="secondary">Cancel</Button>
                <Button type="submit" disabled={saving} className="min-h-11 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? 'Saving changes…' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>

          <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-slate-900">Opportunity actions</h2>
            <p className="mt-1 text-sm text-slate-500">Manage this posting separately from editing its details.</p>
            {actionError && (
              <p role="status" className={`mt-4 text-sm ${actionError.includes('successfully') ? 'text-emerald-700' : 'text-red-600'}`}>
                {actionError}
              </p>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {opportunity?.status === 'DRAFT' && (
                <Button
                  type="button"
                  disabled={publishing}
                  onClick={handlePublish}
                  className="disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {publishing ? 'Publishing…' : 'Publish Opportunity'}
                </Button>
              )}
              <button
                type="button"
                onClick={() => setDeleteConfirmationOpen(true)}
                className="rounded-md border border-red-200 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Delete Opportunity
              </button>
            </div>
          </section>
        </>
      )}

      {deleteConfirmationOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="presentation">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-opportunity-title"
            aria-describedby="delete-opportunity-description"
            className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-start gap-3">
              <Icon name="alertTriangle" className="mt-0.5 size-6 shrink-0 text-red-600" />
              <div>
                <h2 id="delete-opportunity-title" className="font-display text-lg font-bold text-navy">Delete this opportunity?</h2>
                <p id="delete-opportunity-description" className="mt-2 text-sm leading-6 text-slate-600">
                  This action permanently removes the opportunity and cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteConfirmationOpen(false)}
                className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
