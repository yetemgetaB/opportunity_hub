import { useEffect, useState, type FormEvent } from 'react'
import Button from '../../components/ui/Button'
import { ApiError } from '../../services/api'
import { studentService, type StudentProfile, type StudentProfilePayload } from '../../services/studentService'

const emptyProfile: StudentProfilePayload = {
  academicYear: 1,
  university: '',
  fieldOfStudy: '',
  location: '',
  careerGoals: '',
  careerGoalTags: [],
  interests: [],
  isDiscoverable: true,
}

function commaValues(value: string) {
  return value.split(',').map((part) => part.trim()).filter(Boolean)
}

function inputClass() {
  return 'mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfilePayload>(emptyProfile)
  const [careerTags, setCareerTags] = useState('')
  const [interests, setInterests] = useState('')
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    studentService.getProfile().then((result: StudentProfile) => {
      if (!active) return
      setProfile(result)
      setCareerTags(result.careerGoalTags.join(', '))
      setInterests(result.interests.join(', '))
      setHasProfile(true)
    }).catch((cause: unknown) => {
      if (!active) return
      if (cause instanceof ApiError && cause.status === 404) {
        setMessage('Complete your profile to get started.')
      } else {
        setMessage(cause instanceof Error ? cause.message : 'Unable to load your profile.')
      }
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function update<K extends keyof StudentProfilePayload>(key: K, value: StudentProfilePayload[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = {
      ...profile,
      careerGoalTags: commaValues(careerTags),
      interests: commaValues(interests),
    }
    try {
      const saved = hasProfile
        ? await studentService.updateProfile(payload)
        : await studentService.createProfile(payload)
      setProfile(saved)
      setHasProfile(true)
      setMessage('Profile saved.')
    } catch (cause: unknown) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to save your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-navy">Student Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Update the academic and career information supported by your profile.</p>
      </header>

      {message && (
        <p role={message.includes('Unable') ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${
          message.includes('Unable') ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600'
        }`}>{message}</p>
      )}

      {loading ? (
        <div className="h-72 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-label="Loading profile" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 sm:p-7">
          <fieldset disabled={saving} className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">
              University
              <input className={inputClass()} value={profile.university ?? ''} required onChange={(event) => update('university', event.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Field of study
              <input className={inputClass()} value={profile.fieldOfStudy ?? ''} required onChange={(event) => update('fieldOfStudy', event.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Academic year
              <select className={inputClass()} value={profile.academicYear ?? 1} onChange={(event) => update('academicYear', Number(event.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>Year {year}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800">
              Location
              <input className={inputClass()} value={profile.location ?? ''} onChange={(event) => update('location', event.target.value || null)} />
            </label>
            <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
              Career goals
              <textarea className={inputClass()} rows={3} value={profile.careerGoals ?? ''} onChange={(event) => update('careerGoals', event.target.value || null)} />
            </label>
            <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
              Career goal tags <span className="font-normal text-slate-500">(comma separated)</span>
              <input className={inputClass()} value={careerTags} onChange={(event) => setCareerTags(event.target.value)} />
            </label>
            <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
              Interests <span className="font-normal text-slate-500">(comma separated)</span>
              <input className={inputClass()} value={interests} onChange={(event) => setInterests(event.target.value)} />
            </label>
            <label className="flex items-start gap-3 text-sm text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                checked={profile.isDiscoverable ?? true}
                onChange={(event) => update('isDiscoverable', event.target.checked)}
                className="mt-0.5 size-4 accent-brand"
              />
              Allow organizations to discover my profile
            </label>
          </fieldset>
          <div className="flex flex-col-reverse items-start justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">Resume uploads, project portfolios, and skill catalogs are not supported by the current profile API.</p>
            <Button type="submit" disabled={saving} className="w-full rounded-lg px-6 py-3 font-bold disabled:opacity-60 sm:w-auto">
              {saving ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
