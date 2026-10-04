import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ApplicantProfileHeader from '../../components/applicants/ApplicantProfileHeader'
import ApplicantTabs from '../../components/applicants/ApplicantTabs'
import ApplicationTimeline from '../../components/applicants/ApplicationTimeline'
import MatchScoreBar from '../../components/applicants/MatchScoreBar'
import Icon from '../../components/ui/Icon'
import { APPLICANTS, APPLICANT_PROFILES } from '../../utils/organizationData'

export default function ApplicantDetailsPage() {
  const { id } = useParams()
  const [tab, setTab] = useState<'profile' | 'cv' | 'test' | 'analysis'>('profile')
  const applicant = id ? APPLICANTS.find((candidate) => candidate.id === id) : undefined
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
    <div className="space-y-6">
      <Link
        to="/organization/applicants"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-navy"
      >
        <Icon name="chevronRight" className="h-4 w-4 rotate-180" />
        Applicant Hub
      </Link>

      <ApplicantProfileHeader a={a} applicant={applicant} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <ApplicantTabs active={tab} onChange={setTab} />

            {tab === 'profile' && (
              <div className="mt-6 space-y-6">
                <section>
                  <h2 className="text-lg font-bold text-navy">Candidate Overview</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{a.biography}</p>
                </section>

                {applicant && (
                  <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-navy">AI Match Overview</h3>
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
                        {applicant.matchTier}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-navy">Overall match</span>
                          <span className="text-sm font-bold text-brand">{applicant.matchScore}%</span>
                        </div>
                        <MatchScoreBar score={applicant.matchScore} tier={applicant.matchTier} />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-navy">Skills match</span>
                          <span className="text-sm font-bold text-brand">{applicant.skillsMatch}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${applicant.skillsMatch}%` }} />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="text-base font-bold text-navy">Technical Skills</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.technicalSkills.map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-navy">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                <div className="grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
                  <section>
                    <h3 className="text-sm font-semibold text-slate-400">Experience</h3>
                    <p className="mt-2 text-sm font-semibold text-navy">{a.experienceTitle}</p>
                    <p className="mt-1 text-sm text-slate-500">{a.experienceCompany} <span className="mx-1">·</span> {a.experiencePeriod}</p>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold text-slate-400">Career Goals</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{a.careerGoals}</p>
                  </section>
                </div>
              </div>
            )}

            {tab === 'cv' && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                <Icon name="file" className="mx-auto h-8 w-8 text-slate-400" />
                <h2 className="mt-3 text-sm font-semibold text-navy">No resume available</h2>
                <p className="mt-1 text-sm text-slate-500">This applicant hasn't uploaded a CV yet.</p>
              </div>
            )}
            {tab === 'test' && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                <Icon name="clipboard" className="mx-auto h-8 w-8 text-slate-400" />
                <h2 className="mt-3 text-sm font-semibold text-navy">No test answers submitted</h2>
                <p className="mt-1 text-sm text-slate-500">Assessment answers will appear here once submitted.</p>
              </div>
            )}
            {tab === 'analysis' && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-10 text-center">
                <Icon name="sparkles" className="mx-auto h-8 w-8 text-brand" />
                <h2 className="mt-3 text-sm font-semibold text-navy">AI analysis is processing</h2>
                <p className="mt-1 text-sm text-slate-500">A detailed candidate analysis will be available here soon.</p>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">AI recommendation &amp; summary</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {applicant?.matchTier === 'Excellent Fit'
                  ? `${a.name} is a strong match for this opportunity, with a ${applicant.matchScore}% overall match and ${applicant.skillsMatch}% skills alignment.`
                  : applicant
                    ? `${a.name} shows a ${applicant.matchTier.toLowerCase()} for this opportunity, with a ${applicant.matchScore}% overall match and ${applicant.skillsMatch}% skills alignment.`
                    : `${a.name}'s profile is ready for review.`}
              </p>
            </div>
            <Link
              to={`/organization/applicants/${a.id}/assessment`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-bold text-navy transition hover:brightness-105"
            >
              Review Assessment
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </section>
        </div>

        <ApplicationTimeline applicantId={a.id} events={a.timeline} />
      </div>
    </div>
  )
}
