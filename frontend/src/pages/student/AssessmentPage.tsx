/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { StudentAssessment, StudentAssessmentQuestion } from '../../types/assessment'
import { assessmentService } from '../../services/assessmentService'

export default function AssessmentPage() {
  const { id } = useParams<{ id: string }>()
  const [assessment, setAssessment] = useState<StudentAssessment>()
  const [questions, setQuestions] = useState<StudentAssessmentQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setError('No assessment was selected.')
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    Promise.all([assessmentService.getAssessment(id), assessmentService.getQuestions(id)])
      .then(([details, assessmentQuestions]) => {
        if (active) {
          setAssessment(details)
          setQuestions(assessmentQuestions)
          setError('')
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load this assessment.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link to="/student/applications" className="inline-flex text-sm font-semibold text-brand hover:underline">Back to applications</Link>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <div className="h-72 animate-pulse rounded-xl border border-neutral-200 bg-white" aria-label="Loading assessment" />
      ) : assessment ? (
        <>
          <header className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Assessment preview</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-navy">{assessment.title}</h1>
            {assessment.instructions && <p className="mt-3 text-sm leading-6 text-slate-600">{assessment.instructions}</p>}
          </header>
          <section className="space-y-4">
            <h2 className="font-display text-lg font-bold text-navy">Questions</h2>
            {questions.length ? questions.map((question, index) => (
              <article key={question.id} className="rounded-xl border border-neutral-200 bg-white p-5">
                <p className="text-xs font-semibold text-slate-500">Question {index + 1} · {question.questionType.replace('_', ' ').toLowerCase()}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-800">{question.questionText}</p>
                {question.options?.length ? (
                  <ul className="mt-3 space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <li key={typeof option === 'string' ? option : option.value} className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600">
                        {typeof option === 'string' ? option : option.label || option.value || `Option ${optionIndex + 1}`}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            )) : (
              <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-slate-500">No questions are available for this assessment.</p>
            )}
          </section>
          <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            This assessment can be viewed, but the backend does not currently provide endpoints for student attempts, answer submission, or results.
          </p>
        </>
      ) : null}
    </div>
  )
}
