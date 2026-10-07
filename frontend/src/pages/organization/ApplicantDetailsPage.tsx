/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import type { OpportunityApplicant } from '../../services/applicationService'
import type { OrganizationOpportunity } from '../../types/opportunity'
import { applicationService } from '../../services/applicationService'
import { opportunityService } from '../../services/opportunityService'
import { applicationStatusLabel } from '../../utils/applicantData'

export default function ApplicantDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [applicant, setApplicant] = useState<OpportunityApplicant>()
  const [opportunity, setOpportunity] = useState<OrganizationOpportunity>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id) {
      setError('Applicant not found.')
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    Promise.all([opportunityService.getMyOpportunities()])
      .then(async ([opportunities]) => {
        const groups = await Promise.all(opportunities.map(async (item) => ({
          opportunity: item,
          applicants: await applicationService.getApplicants(item.id),
        })))
        const match = groups.flatMap((group) => group.applicants.map((record) => ({ ...group, record })))
          .find((entry) => entry.record.application.id === id)
        if (active) {
          setApplicant(match?.record)
          setOpportunity(match?.opportunity)
          if (!match) setError('This applicant could not be found for your opportunities.')
          else setError('')
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load this applicant.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  async function updateStatus(status: OpportunityApplicant['application']['status']) {
    if (!applicant || !opportunity) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await applicationService.updateStatus(opportunity.id, applicant.application.id, status)
      setApplicant((current) => current ? {
        ...current,
        application: { ...current.application, status },
      } : current)
      setMessage('Application status updated.')
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Unable to update this application.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="h-80 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-label="Loading applicant" />

  if (!applicant || !opportunity) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <p role="alert" className="text-sm text-slate-600">{error || 'Applicant not found.'}</p>
        <Link to="/organization/applicants" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">Back to Applicants</Link>
      </div>
    )
  }

  const name = [applicant.student.firstName, applicant.student.middleName, applicant.student.lastName].filter(Boolean).join(' ')
  const profile = applicant.student.profile

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link to="/organization/applicants" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-navy">
        <Icon name="chevronRight" className="size-4 rotate-180" /> Applicant Hub
      </Link>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

      <header className="flex flex-col gap-5 rounded-xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-navy text-lg font-bold text-white">
            {[applicant.student.firstName, applicant.student.lastName].map((part) => part[0] ?? '').join('').toUpperCase()}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-navy">{name}</h1>
            <p className="mt-1 text-sm text-slate-500">{profile.university} · {profile.fieldOfStudy}</p>
            <p className="mt-1 text-xs text-slate-500">{opportunity.title} · {applicationStatusLabel(applicant.application.status)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="applicant-status">Application status</label>
          <select
            id="applicant-status"
            value={applicant.application.status}
            disabled={saving}
            onChange={(event) => void updateStatus(event.target.value as OpportunityApplicant['application']['status'])}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-navy"
          >
            {(['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] as const).map((status) => (
              <option key={status} value={status}>{applicationStatusLabel(status)}</option>
            ))}
          </select>
          <Link to={`/organization/assessment?opportunityId=${encodeURIComponent(opportunity.id)}`} className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-navy hover:brightness-105">
            View AI Results
          </Link>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-navy">Candidate Profile</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">University</dt><dd className="mt-1 text-sm font-medium text-slate-800">{profile.university}</dd></div>
              <div><dt className="text-xs text-slate-500">Field of study</dt><dd className="mt-1 text-sm font-medium text-slate-800">{profile.fieldOfStudy}</dd></div>
              <div><dt className="text-xs text-slate-500">Academic year</dt><dd className="mt-1 text-sm font-medium text-slate-800">Year {profile.academicYear}</dd></div>
              {profile.location && <div><dt className="text-xs text-slate-500">Location</dt><dd className="mt-1 text-sm font-medium text-slate-800">{profile.location}</dd></div>}
            </dl>
            {profile.careerGoals && <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">{profile.careerGoals}</p>}
            {profile.careerGoalTags.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{profile.careerGoalTags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{tag}</span>)}</div>}
          </section>
          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-navy">Skills</h2>
            {applicant.student.skills.length ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {applicant.student.skills.map((skill) => <li key={skill.skillId} className="rounded-lg border border-slate-100 p-3 text-sm"><span className="font-semibold text-slate-800">{skill.name}</span>{skill.proficiency && <span className="ml-2 text-xs text-slate-500">{skill.proficiency}</span>}</li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-slate-500">No skills have been added to this profile.</p>}
          </section>
          <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold text-navy">Experience</h2>
            {applicant.student.experiences.length ? (
              <ul className="mt-4 space-y-4">
                {applicant.student.experiences.map((experience) => <li key={experience.id} className="border-l-2 border-brand pl-4"><h3 className="text-sm font-semibold text-slate-800">{experience.title}</h3><p className="mt-1 text-xs text-slate-500">{experience.organizationName} · {experience.experienceType}</p>{experience.description && <p className="mt-2 text-sm leading-5 text-slate-600">{experience.description}</p>}</li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-slate-500">No experience has been added to this profile.</p>}
          </section>
        </div>
        <aside className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-navy">CV / Resume</h2>
          {applicant.student.cvs.length ? (
            <ul className="mt-4 space-y-3">
              {applicant.student.cvs.map((cv) => <li key={cv.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"><Icon name="file" className="size-5 text-brand" /><span className="min-w-0 truncate text-sm text-slate-700">{cv.fileName}</span></li>)}
            </ul>
          ) : <p className="mt-3 text-sm text-slate-500">No CV is available for this applicant.</p>}
          <p className="mt-4 text-xs leading-5 text-slate-400">CV metadata is available, but the current applicant API does not provide file download URLs.</p>
        </aside>
      </div>
    </div>
  )
}
