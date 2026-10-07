import { useEffect, useState, type FormEvent } from 'react'
import Button from '../../components/ui/Button'
import { organizationService, type OrganizationProfilePayload } from '../../services/organizationService'

const fieldClass = 'mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'

export default function ProfilePage() {
  const [profile, setProfile] = useState<OrganizationProfilePayload>({
    name: '',
    description: '',
    websiteUrl: '',
    contactEmail: '',
    contactPhone: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    organizationService.getProfile().then((result) => {
      if (active) setProfile({
        name: result.name,
        description: result.description ?? '',
        websiteUrl: result.websiteUrl ?? '',
        contactEmail: result.contactEmail ?? '',
        contactPhone: result.contactPhone ?? '',
      })
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : 'Unable to load your organization profile.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function update<K extends keyof OrganizationProfilePayload>(key: K, value: OrganizationProfilePayload[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const result = await organizationService.updateProfile(profile)
      setProfile({
        name: result.name,
        description: result.description ?? '',
        websiteUrl: result.websiteUrl ?? '',
        contactEmail: result.contactEmail ?? '',
        contactPhone: result.contactPhone ?? '',
      })
      setMessage('Organization profile saved.')
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Unable to save your organization profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-navy">Organization Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage the organization details supported by the current backend.</p>
      </header>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">{message}</p>}
      {loading ? (
        <div className="h-72 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-label="Loading organization profile" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-7">
          <fieldset disabled={saving} className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
              Organization name
              <input className={fieldClass} value={profile.name ?? ''} required onChange={(event) => update('name', event.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
              Description
              <textarea className={fieldClass} rows={4} value={profile.description ?? ''} onChange={(event) => update('description', event.target.value || null)} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Website
              <input type="url" className={fieldClass} value={profile.websiteUrl ?? ''} onChange={(event) => update('websiteUrl', event.target.value || null)} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Contact email
              <input type="email" className={fieldClass} value={profile.contactEmail ?? ''} onChange={(event) => update('contactEmail', event.target.value || null)} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Contact phone
              <input type="tel" className={fieldClass} value={profile.contactPhone ?? ''} onChange={(event) => update('contactPhone', event.target.value || null)} />
            </label>
          </fieldset>
          <div className="flex justify-end border-t border-slate-100 pt-5">
            <Button type="submit" disabled={saving} className="w-full rounded-lg px-6 py-3 font-bold disabled:opacity-60 sm:w-auto">
              {saving ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
