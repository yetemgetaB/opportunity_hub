import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ApplicantProfileHeader from '../../components/applicants/ApplicantProfileHeader'
import ApplicantTabs from '../../components/applicants/ApplicantTabs'
import ApplicationTimeline from '../../components/applicants/ApplicationTimeline'
import { APPLICANT_PROFILES } from '../../utils/organizationData'

export default function ApplicantDetailsPage() {
  const { id } = useParams()
  const [tab, setTab] = useState<'profile' | 'cv' | 'test' | 'analysis'>('profile')
  const a = id ? APPLICANT_PROFILES[id] : undefined

  if (!a) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm text-slate-500">We couldn't find that applicant.</p>
        <Link to="/organization/applicants" className="mt-3 inline-block text-sm font-semibold text-brand">
          Back to Applicant Hub
        </Link>
      </div>
    )
  }

  return (
    <div>
      <ApplicantProfileHeader a={a} />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ApplicantTabs active={tab} onChange={setTab} />

          {tab === 'profile' && (
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Biography</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{a.biography}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Technical Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {a.technicalSkills.map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-navy">{s}</span>
                  ))}
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience</p>
                  <p className="mt-2 text-sm font-semibold text-navy">{a.experienceTitle}</p>
                  <p className="text-xs text-slate-500">{a.experienceCompany} · {a.experiencePeriod}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Career Goals</p>
                  <p className="mt-2 text-sm text-slate-600">{a.careerGoals}</p>
                </div>
              </div>
            </div>
          )}

          {/* TODO: build these out once resumes, assessment answers and AI analysis exist */}
          {tab === 'cv' && <p className="mt-6 text-sm text-slate-500">This applicant hasn't uploaded a CV yet.</p>}
          {tab === 'test' && <p className="mt-6 text-sm text-slate-500">No test answers submitted yet.</p>}
          {tab === 'analysis' && <p className="mt-6 text-sm text-slate-500">AI analysis is still processing.</p>}
        </div>

        <ApplicationTimeline applicantId={a.id} events={a.timeline} />
      </div>
    </div>
  )
}