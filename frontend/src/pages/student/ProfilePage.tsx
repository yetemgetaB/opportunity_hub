import { useEffect, useState, type FormEvent } from 'react'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import { ApiError } from '../../services/api'
import { studentService, type StudentProfilePayload } from '../../services/studentService'
import { skillService, type SkillItem, type StudentSkillItem } from '../../services/skillService'

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
  return 'mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
}

const proficiencyLabels: Record<number, string> = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfilePayload>(emptyProfile)
  const [careerTags, setCareerTags] = useState('')
  const [interests, setInterests] = useState('')
  const [hasProfile, setHasProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Skills state
  const [allSkills, setAllSkills] = useState<SkillItem[]>([])
  const [mySkills, setMySkills] = useState<StudentSkillItem[]>([])
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [selectedProficiency, setSelectedProficiency] = useState(3)
  const [skillsSaving, setSkillsSaving] = useState(false)

  useEffect(() => {
    let active = true

    Promise.allSettled([
      studentService.getProfile(),
      skillService.listAll(),
      skillService.getMySkills(),
    ]).then(([profileRes, allSkillsRes, mySkillsRes]) => {
      if (!active) return

      if (profileRes.status === 'fulfilled') {
        const result = profileRes.value
        setProfile(result)
        setCareerTags(result.careerGoalTags.join(', '))
        setInterests(result.interests.join(', '))
        setHasProfile(true)
      } else {
        const cause = profileRes.reason
        if (cause instanceof ApiError && cause.status === 404) {
          setMessage('Complete your academic profile to enable tailored opportunities.')
        } else {
          setMessage(cause instanceof Error ? cause.message : 'Unable to load profile.')
        }
      }

      if (allSkillsRes.status === 'fulfilled') {
        setAllSkills(allSkillsRes.value)
      }

      if (mySkillsRes.status === 'fulfilled') {
        setMySkills(mySkillsRes.value)
      }

      setLoading(false)
    })

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
      setMessage('Profile saved successfully.')
    } catch (cause: unknown) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to save your profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddSkill() {
    if (!selectedSkillId) return
    setSkillsSaving(true)
    try {
      const updated = await skillService.addSkill(selectedSkillId, selectedProficiency)
      setMySkills((prev) => {
        const filtered = prev.filter((s) => s.skillId !== selectedSkillId)
        return [...filtered, updated]
      })
      setSelectedSkillId('')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to add skill.')
    } finally {
      setSkillsSaving(false)
    }
  }

  async function handleRemoveSkill(skillId: string) {
    setSkillsSaving(true)
    try {
      await skillService.removeSkill(skillId)
      setMySkills((prev) => prev.filter((s) => s.skillId !== skillId))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to remove skill.')
    } finally {
      setSkillsSaving(false)
    }
  }

  // Filter skills not yet added
  const availableToAdd = allSkills.filter(
    (skill) => !mySkills.some((my) => my.skillId === skill.id)
  )

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-navy">Student Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your academic background, career goals, and skills to boost opportunity match scores.
        </p>
      </header>

      {message && (
        <p
          role={message.includes('Unable') ? 'alert' : 'status'}
          className={`rounded-lg border p-3.5 text-sm font-medium ${
            message.includes('Unable')
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {message}
        </p>
      )}

      {loading ? (
        <div className="h-72 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-label="Loading profile" />
      ) : (
        <>
          {/* 1. Academic & Personal Information */}
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-display text-lg font-bold text-navy">Academic & Career Details</h2>
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
                <input className={inputClass()} value={profile.location ?? ''} placeholder="e.g. Addis Ababa, Ethiopia" onChange={(event) => update('location', event.target.value || null)} />
              </label>
              <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                Career goals
                <textarea className={inputClass()} rows={3} value={profile.careerGoals ?? ''} placeholder="Describe your career aspirations and what you aim to achieve..." onChange={(event) => update('careerGoals', event.target.value || null)} />
              </label>
              <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                Career goal tags <span className="font-normal text-slate-500">(comma separated)</span>
                <input className={inputClass()} value={careerTags} placeholder="e.g. Software Engineering, Cloud Architecture, AI" onChange={(event) => setCareerTags(event.target.value)} />
              </label>
              <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
                Interests <span className="font-normal text-slate-500">(comma separated)</span>
                <input className={inputClass()} value={interests} placeholder="e.g. Web Development, Distributed Systems, Machine Learning" onChange={(event) => setInterests(event.target.value)} />
              </label>
              <label className="flex items-start gap-3 text-sm text-slate-700 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={profile.isDiscoverable ?? true}
                  onChange={(event) => update('isDiscoverable', event.target.checked)}
                  className="mt-0.5 size-4 accent-amber-500"
                />
                Allow verified organizations to discover my profile and invite me to apply
              </label>
            </fieldset>
            <div className="flex justify-end border-t border-slate-100 pt-5">
              <Button type="submit" disabled={saving} className="rounded-lg px-6 py-2.5 font-bold shadow-sm">
                {saving ? 'Saving…' : 'Save Details'}
              </Button>
            </div>
          </form>

          {/* 2. Configurable Skills Management */}
          <section className="space-y-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-navy">My Skills & Proficiencies</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Select standardized skills to increase your opportunity matching confidence score.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 w-fit">
                {mySkills.length} skills added
              </span>
            </div>

            {/* Current Skills Pill Badges */}
            {mySkills.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {mySkills.map((item) => (
                  <div
                    key={item.skillId}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs text-slate-800 shadow-sm transition hover:border-amber-300"
                  >
                    <span className="font-semibold text-navy">{item.skill.name}</span>
                    <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-medium text-amber-900">
                      {proficiencyLabels[item.proficiency] ?? 'Level ' + item.proficiency}
                    </span>
                    <button
                      type="button"
                      disabled={skillsSaving}
                      onClick={() => handleRemoveSkill(item.skillId)}
                      className="ml-0.5 text-slate-400 hover:text-red-600 focus:outline-none"
                      title={`Remove ${item.skill.name}`}
                    >
                      <Icon name="close" className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                No skills added yet. Choose from the catalog below to boost your dashboard match score!
              </div>
            )}

            {/* Add Skill Controls */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Add a Skill</h3>
              <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
                <div>
                  <label htmlFor="skill-select" className="sr-only">Choose a skill</label>
                  <select
                    id="skill-select"
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-500"
                  >
                    <option value="">Select a skill from catalog…</option>
                    {availableToAdd.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="proficiency-select" className="sr-only">Proficiency</label>
                  <select
                    id="proficiency-select"
                    value={selectedProficiency}
                    onChange={(e) => setSelectedProficiency(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-amber-500"
                  >
                    <option value={1}>1 - Beginner</option>
                    <option value={2}>2 - Elementary</option>
                    <option value={3}>3 - Intermediate</option>
                    <option value={4}>4 - Advanced</option>
                    <option value={5}>5 - Expert</option>
                  </select>
                </div>
                <button
                  type="button"
                  disabled={!selectedSkillId || skillsSaving}
                  onClick={handleAddSkill}
                  className="inline-flex items-center justify-center rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {skillsSaving ? 'Adding…' : 'Add Skill'}
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
