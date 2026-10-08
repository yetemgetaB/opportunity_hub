import { useState } from 'react'
import Button from '../ui/Button'
import TextField from '../ui/TextField'
import Select from '../ui/Select'
import Toggle from '../ui/Toggle'
import Icon from '../ui/Icon'
import { studentService, type StudentProfilePayload } from '../../services/studentService'

interface Props {
  isOpen: boolean
  onComplete: () => void
  studentName?: string
}

const ACADEMIC_YEARS = [
  'Year 1 (Freshman)',
  'Year 2 (Sophomore)',
  'Year 3 (Junior)',
  'Year 4 (Senior)',
  'Year 5+ / Finalist',
  'Graduate / Masters',
]

const POPULAR_FIELDS = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Electrical & Computer Engineering',
  'Data Science & Analytics',
  'Business & Information Systems',
  'Mechanical Engineering',
  'Civil Engineering',
]

const SUGGESTED_INTERESTS = [
  'Software Engineering',
  'Full Stack Development',
  'Artificial Intelligence / ML',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'Mobile App Development',
  'UI/UX Design',
  'Product Management',
  'FinTech',
]

export default function OnboardingModal({ isOpen, onComplete, studentName }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form State
  const [university, setUniversity] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [academicYearStr, setAcademicYearStr] = useState('Year 1 (Freshman)')
  const [location, setLocation] = useState('Remote')
  const [careerGoals, setCareerGoals] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState('')
  const [isDiscoverable, setIsDiscoverable] = useState(true)

  if (!isOpen) return null

  function parseAcademicYear(str: string): number {
    if (str.startsWith('Year 1')) return 1
    if (str.startsWith('Year 2')) return 2
    if (str.startsWith('Year 3')) return 3
    if (str.startsWith('Year 4')) return 4
    if (str.startsWith('Year 5')) return 5
    if (str.startsWith('Graduate')) return 6
    return 1
  }

  function toggleInterest(tag: string) {
    setSelectedInterests((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    )
  }

  function addCustomTag() {
    const trimmed = customTagInput.trim()
    if (trimmed && !selectedInterests.includes(trimmed)) {
      setSelectedInterests((current) => [...current, trimmed])
      setCustomTagInput('')
    }
  }

  function handleNextStep() {
    setError('')
    if (step === 1) {
      if (!university.trim()) {
        setError('Please enter your university or college.')
        return
      }
      if (!fieldOfStudy.trim()) {
        setError('Please enter or select your field of study.')
        return
      }
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  async function handleFinish() {
    setError('')
    setSubmitting(true)
    try {
      const payload: Omit<StudentProfilePayload, 'userId'> = {
        university: university.trim(),
        fieldOfStudy: fieldOfStudy.trim(),
        academicYear: parseAcademicYear(academicYearStr),
        location: location.trim() || null,
        careerGoals: careerGoals.trim() || null,
        careerGoalTags: selectedInterests,
        interests: selectedInterests,
        isDiscoverable,
      }

      await studentService.createProfile(payload)
      setSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 1200)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to complete profile. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-slate-800 p-6 text-white sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/20 text-brand">
                <Icon name="sparkles" className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Student Setup
              </span>
            </div>
            <div className="text-xs font-medium text-slate-300">
              Step {step} of 3
            </div>
          </div>

          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {step === 1 && `Welcome${studentName ? `, ${studentName}` : ''}! Let's set up your profile`}
            {step === 2 && 'What are your career interests?'}
            {step === 3 && 'Preferences & Ready to Match!'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
            {step === 1 && 'Tell us where you study so we can match you with eligible campus opportunities.'}
            {step === 2 && 'Pick your target roles and technical skills to power your AI recommendations.'}
            {step === 3 && 'Review your details and let verified companies discover your potential.'}
          </p>

          {/* Stepper progress track */}
          <div className="mt-6 flex gap-2">
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-brand' : 'bg-slate-700'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-brand' : 'bg-slate-700'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-brand' : 'bg-slate-700'}`} />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {success ? (
            <div className="py-8 text-center animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
                <Icon name="check" className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold text-slate-900">Profile Complete! 🎉</h3>
              <p className="mt-2 text-sm text-slate-600">
                Loading your personalized opportunities and matching score…
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* STEP 1: Academic Background */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <TextField
                      label="University / College"
                      placeholder="e.g. Stanford University, Addis Ababa University"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <TextField
                      label="Field of Study / Major"
                      placeholder="e.g. Computer Science, Software Engineering"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      required
                    />
                    {/* Quick suggestions */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {POPULAR_FIELDS.slice(0, 4).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFieldOfStudy(f)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                            fieldOfStudy === f
                              ? 'border-brand bg-brand/10 text-brand'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Select
                      label="Current Academic Year"
                      options={ACADEMIC_YEARS}
                      value={academicYearStr}
                      onChange={(e) => setAcademicYearStr(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Career Goals & Interests */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <TextField
                      label="Preferred Location"
                      placeholder="e.g. Remote, Addis Ababa, New York"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-navy">
                      Career Goals Summary
                    </label>
                    <textarea
                      rows={2}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      placeholder="e.g. Seeking software engineering internships, open to machine learning projects and hackathons."
                      value={careerGoals}
                      onChange={(e) => setCareerGoals(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-navy">
                      Skills & Interest Areas
                    </label>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {SUGGESTED_INTERESTS.map((interest) => {
                        const isSelected = selectedInterests.includes(interest)
                        return (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => toggleInterest(interest)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                              isSelected
                                ? 'border-brand bg-brand text-white shadow-sm'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {interest}
                          </button>
                        )
                      })}
                    </div>

                    {/* Custom Tag Add */}
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Add custom skill (e.g. Docker, Figma)..."
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCustomTag()
                          }
                        }}
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-brand"
                      />
                      <button
                        type="button"
                        onClick={addCustomTag}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Discoverability */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</h4>
                    <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
                      <div><span className="font-semibold text-slate-900">University:</span> {university}</div>
                      <div><span className="font-semibold text-slate-900">Major:</span> {fieldOfStudy}</div>
                      <div><span className="font-semibold text-slate-900">Year:</span> {academicYearStr}</div>
                      <div><span className="font-semibold text-slate-900">Location:</span> {location || 'Not specified'}</div>
                    </div>
                    {selectedInterests.length > 0 && (
                      <div className="mt-3 border-t border-slate-200 pt-2.5">
                        <span className="font-semibold text-slate-900 text-xs">Interests:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedInterests.map((t) => (
                            <span key={t} className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-950">Recruiter Discoverability</p>
                      <p className="text-xs text-amber-900/80 leading-relaxed">
                        Allow hiring organizations to find your profile for matching opportunities and fast-track invitations.
                      </p>
                    </div>
                    <Toggle
                      checked={isDiscoverable}
                      onChange={setIsDiscoverable}
                      label="Recruiter Discoverability"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                    disabled={submitting}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="min-w-28 rounded-xl px-5 py-2.5 text-xs font-bold"
                  >
                    Continue →
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleFinish}
                    disabled={submitting}
                    className="min-w-36 rounded-xl px-6 py-2.5 text-xs font-bold shadow-md shadow-brand/20"
                  >
                    {submitting ? 'Saving Profile…' : 'Complete Setup 🚀'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
