import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import Button from '../ui/Button'
import { studentService, type StudentProfile, type CvItem } from '../../services/studentService'
import { applicationService } from '../../services/applicationService'
import { useAuthContext } from '../../context/AuthContext'
import type { Opportunity } from '../../types/student'

interface Props {
  isOpen: boolean
  opportunity: Opportunity
  onClose: () => void
  onSuccess: () => void
}

export default function ApplyModal({ isOpen, opportunity, onClose, onSuccess }: Props) {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [cvs, setCvs] = useState<CvItem[]>([])
  const [selectedCvId, setSelectedCvId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Quick CV upload state inside modal
  const [uploadingCv, setUploadingCv] = useState(false)
  const [cvUploadError, setCvUploadError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false)
      setError('')
      return
    }

    let active = true
    setLoading(true)
    setError('')

    Promise.allSettled([
      studentService.getProfile(),
      studentService.getCvs(),
    ]).then(([profileRes, cvsRes]) => {
      if (!active) return

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value)
      }

      if (cvsRes.status === 'fulfilled') {
        const loadedCvs = cvsRes.value
        setCvs(loadedCvs)
        const defaultCv = loadedCvs.find((c) => c.isDefault) ?? loadedCvs[0]
        if (defaultCv) {
          setSelectedCvId(defaultCv.id)
        }
      }

      setLoading(false)
    })

    return () => { active = false }
  }, [isOpen])

  if (!isOpen) return null

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCv(true)
    setCvUploadError('')
    try {
      const newCv = await studentService.uploadCv(file, cvs.length === 0)
      setCvs((prev) => [newCv, ...prev])
      setSelectedCvId(newCv.id)
    } catch (err: unknown) {
      setCvUploadError(err instanceof Error ? err.message : 'Failed to upload CV.')
    } finally {
      setUploadingCv(false)
    }
  }

  async function handleSubmitApplication() {
    setSubmitting(true)
    setError('')
    try {
      await applicationService.apply(opportunity.id)
      setSubmitted(true)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4.5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-navy font-display text-lg font-bold text-white shadow-xs">
              {opportunity.company[0] ?? 'O'}
            </span>
            <div>
              <h2 className="text-base font-bold text-navy leading-tight">{opportunity.title}</h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{opportunity.company} · {opportunity.location || 'Remote'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-navy transition"
            aria-label="Close"
          >
            <Icon name="x" className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {submitted ? (
            /* Success State */
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
                <Icon name="check" className="size-8 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-navy">Application Submitted!</h3>
                <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                  Your profile and application have been submitted to <span className="font-semibold text-navy">{opportunity.company}</span>.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-left text-xs text-emerald-950 space-y-1.5">
                <p className="font-semibold">What happens next?</p>
                <p className="text-emerald-800">
                  The hiring team will review your credentials and skills. You will receive notifications on status updates in your Application Tracker.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Link
                  to="/student/applications"
                  className="flex-1 rounded-xl bg-navy py-3 text-center text-sm font-bold !text-white shadow-xs hover:bg-navy-light transition active:scale-[0.98] dark-button-dark"
                >
                  Track in My Applications →
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Application Form & Review */
            <>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="py-12 text-center text-sm text-slate-500 animate-pulse">
                  Preparing your application package…
                </div>
              ) : (
                <>
                  {/* Student Credentials Summary */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      1. Applicant Credentials
                    </h3>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-navy">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <span className="rounded-full bg-navy/10 px-2.5 py-1 text-xs font-semibold text-navy">
                          {profile?.fieldOfStudy || 'Student'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/80 pt-2.5 text-slate-600">
                        <div>
                          <span className="text-slate-400">University: </span>
                          <span className="font-medium text-navy">{profile?.university || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Academic Year: </span>
                          <span className="font-medium text-navy">
                            {profile?.academicYear ? `Year ${profile.academicYear}` : 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CV / Resume Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        2. Attach Resume / CV
                      </h3>
                      <label className="cursor-pointer text-xs font-semibold text-brand hover:underline">
                        {uploadingCv ? 'Uploading…' : '+ Upload New CV'}
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc"
                          onChange={handleFileUpload}
                          disabled={uploadingCv}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {cvUploadError && (
                      <p className="text-xs text-red-600 mb-2">{cvUploadError}</p>
                    )}

                    {cvs.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                        <Icon name="file" className="mx-auto size-8 text-slate-400 mb-2" />
                        <p className="text-xs font-medium text-slate-700">No CV attached to your profile yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Upload a PDF or DOCX to include with this application</p>
                        <label className="mt-3 inline-block cursor-pointer rounded-lg bg-navy px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-navy-light transition">
                          Browse File
                          <input
                            type="file"
                            accept=".pdf,.docx,.doc"
                            onChange={handleFileUpload}
                            disabled={uploadingCv}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cvs.map((cv) => (
                          <label
                            key={cv.id}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                              selectedCvId === cv.id
                                ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="radio"
                                name="selectedCv"
                                value={cv.id}
                                checked={selectedCvId === cv.id}
                                onChange={() => setSelectedCvId(cv.id)}
                                className="accent-amber-500"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-navy">{cv.fileName}</p>
                                <p className="text-[11px] text-slate-400">
                                  {(cv.fileSize / 1024).toFixed(1)} KB · Added {new Date(cv.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {cv.isDefault && (
                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                Default
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submission Notice */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                    <p>
                      By applying, you agree to share your student profile, verified skills, and selected resume with <span className="font-semibold text-navy">{opportunity.company}</span>.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!submitted && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
            >
              Cancel
            </button>
            <Button
              type="button"
              onClick={handleSubmitApplication}
              disabled={submitting || loading}
              className="min-w-32 rounded-xl py-2.5 text-xs font-bold shadow-xs disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Confirm & Apply'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
