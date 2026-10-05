import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import type {
  AssessmentQuestionOption,
  StudentAssessment,
  StudentAssessmentQuestion,
  StudentAssessmentRouteState,
} from '../../types/assessment'

type Stage = 'intro' | 'questions' | 'review'
type Answers = Record<string, string>

function isOption(value: unknown): value is AssessmentQuestionOption {
  if (typeof value === 'string') return true
  return Boolean(
    value &&
    typeof value === 'object' &&
    'label' in value &&
    typeof value.label === 'string' &&
    'value' in value &&
    typeof value.value === 'string',
  )
}

function isQuestion(value: unknown): value is StudentAssessmentQuestion {
  if (!value || typeof value !== 'object') return false
  if (
    !('id' in value) ||
    typeof value.id !== 'string' ||
    !('questionText' in value) ||
    typeof value.questionText !== 'string' ||
    !('questionType' in value) ||
    (value.questionType !== 'TEXT' && value.questionType !== 'MULTIPLE_CHOICE') ||
    !('questionOrder' in value) ||
    typeof value.questionOrder !== 'number'
  ) return false

  if (!('options' in value) || value.options == null) return value.questionType === 'TEXT'
  return Array.isArray(value.options) && value.options.every(isOption)
}

function assessmentFromState(state: unknown): StudentAssessment | undefined {
  if (!state || typeof state !== 'object' || !('assessment' in state)) return undefined
  const assessment = state.assessment
  if (
    !assessment ||
    typeof assessment !== 'object' ||
    !('id' in assessment) ||
    typeof assessment.id !== 'string' ||
    !('title' in assessment) ||
    typeof assessment.title !== 'string' ||
    !('questions' in assessment) ||
    !Array.isArray(assessment.questions) ||
    assessment.questions.length === 0 ||
    !assessment.questions.every(isQuestion)
  ) return undefined
  return assessment as StudentAssessment
}

function optionLabel(option: AssessmentQuestionOption) {
  return typeof option === 'string' ? option : option.label
}

function optionValue(option: AssessmentQuestionOption) {
  return typeof option === 'string' ? option : option.value
}

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes < 1) return undefined
  if (minutes < 60) return `${minutes} minutes`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours} hr ${remainder} min` : `${hours} ${hours === 1 ? 'hour' : 'hours'}`
}

function QuestionAnswer({ question, value, onChange }: {
  question: StudentAssessmentQuestion
  value: string
  onChange: (answer: string) => void
}) {
  if (question.questionType === 'TEXT') {
    return (
      <label className="block">
        <span className="sr-only">Your answer</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={7}
          className="w-full resize-y rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-navy outline-none placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          placeholder="Write your answer here..."
        />
      </label>
    )
  }

  const options = question.options ?? []
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Choose one answer</legend>
      {options.map((option) => {
        const answerValue = optionValue(option)
        const selected = value === answerValue
        return (
          <label
            key={answerValue}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 text-sm transition ${
              selected
                ? 'border-amber-500 bg-amber-500/10 text-navy'
                : 'border-neutral-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={answerValue}
              checked={selected}
              onChange={() => onChange(answerValue)}
              className="mt-0.5 size-4 shrink-0 accent-amber-500"
            />
            <span>{optionLabel(option)}</span>
          </label>
        )
      })}
      {options.length === 0 && (
        <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This multiple-choice question has no answer options. Please contact the organization before continuing.
        </p>
      )}
    </fieldset>
  )
}

export default function AssessmentPage() {
  const location = useLocation()
  const assessment = useMemo(() => assessmentFromState(location.state as StudentAssessmentRouteState | null), [location.state])
  const questions = useMemo(
    () => assessment ? [...assessment.questions].sort((a, b) => a.questionOrder - b.questionOrder) : [],
    [assessment],
  )
  const [stage, setStage] = useState<Stage>('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})

  useEffect(() => {
    setStage('intro')
    setQuestionIndex(0)
    setAnswers({})
  }, [assessment?.id])

  if (!assessment) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-neutral-200 bg-white p-6 text-center sm:p-10">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-amber-500/10 text-amber-700">
          <Icon name="clipboard" className="size-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-navy">Assessment unavailable</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
          Assessment questions are not available from the current student API. No assessment data has been generated.
        </p>
        <Link
          to="/student/applications"
          className="mt-6 inline-flex rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50"
        >
          Back to applications
        </Link>
      </section>
    )
  }

  if (stage === 'intro') {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/student/applications" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-navy">
          <span aria-hidden="true">←</span> Applications
        </Link>
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Assessment</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-navy">{assessment.title}</h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1.5">{questions.length} questions</span>
            {formatDuration(assessment.timeLimitMinutes) && (
              <span className="rounded-full bg-slate-100 px-3 py-1.5">{formatDuration(assessment.timeLimitMinutes)}</span>
            )}
          </div>
          {assessment.instructions && (
            <div className="mt-6 rounded-lg border border-neutral-200 bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-navy">Instructions</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{assessment.instructions}</p>
            </div>
          )}
          <div className="mt-6">
            <h2 className="font-display text-lg font-bold text-navy">Before you begin</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li className="flex gap-2"><span className="text-amber-600" aria-hidden="true">•</span>Answer each question carefully.</li>
              <li className="flex gap-2"><span className="text-amber-600" aria-hidden="true">•</span>Your answers will be preserved as you move between questions.</li>
              <li className="flex gap-2"><span className="text-amber-600" aria-hidden="true">•</span>Review your responses before submitting.</li>
            </ul>
          </div>
          <Button type="button" onClick={() => setStage('questions')} className="mt-8 min-h-12 w-full sm:w-auto">
            Start Assessment <span className="ml-2" aria-hidden="true">→</span>
          </Button>
        </section>
      </div>
    )
  }

  if (stage === 'review') {
    return (
      <div className="mx-auto max-w-3xl">
        <section className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Final check</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-navy">Review your answers</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Check each response before you submit. The current assessment API does not expose a student submission endpoint, so submission is not available yet.
          </p>
          <ol className="mt-6 divide-y divide-neutral-200">
            {questions.map((question, index) => {
              const answer = answers[question.id]?.trim()
              return (
                <li key={question.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy">Question {index + 1}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{question.questionText}</p>
                    {answer && <p className="mt-2 line-clamp-3 whitespace-pre-line text-xs leading-5 text-slate-500">{answer}</p>}
                  </div>
                  <span className={`shrink-0 text-xs font-semibold ${answer ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {answer ? 'Answered' : 'Not answered'}
                  </span>
                </li>
              )
            })}
          </ol>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" onClick={() => setStage('questions')}>Go back</Button>
            <Button type="button" disabled className="cursor-not-allowed opacity-60">
              Submit assessment
            </Button>
          </div>
          <p className="mt-3 text-right text-xs text-slate-500">
            Submission will be enabled when the backend provides the student submission endpoint.
          </p>
        </section>
      </div>
    )
  }

  const question = questions[questionIndex]
  const answeredCount = questions.filter((item) => Boolean(answers[item.id]?.trim())).length
  const progress = Math.round(((questionIndex + 1) / questions.length) * 100)

  function updateAnswer(value: string) {
    setAnswers((current) => ({ ...current, [question.id]: value }))
  }

  function goNext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (questionIndex === questions.length - 1) setStage('review')
    else setQuestionIndex((index) => index + 1)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Assessment</p>
          <h1 className="mt-1 font-display text-xl font-bold text-navy">{assessment.title}</h1>
        </div>
        <p className="text-sm font-medium text-slate-600">Question {questionIndex + 1} of {questions.length}</p>
      </div>
      <div className="mb-5">
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Assessment progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1.5 text-right text-xs text-slate-500">{progress}%</p>
      </div>
      <form onSubmit={goNext} className="rounded-xl border border-neutral-200 bg-white p-6 sm:p-9">
        <p className="text-xs font-semibold text-slate-500">Question {questionIndex + 1}</p>
        <h2 className="mt-2 font-display text-xl font-bold leading-7 text-navy">{question.questionText}</h2>
        <div className="mt-6">
          <QuestionAnswer
            question={question}
            value={answers[question.id] ?? ''}
            onChange={updateAnswer}
          />
        </div>
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            disabled={questionIndex === 0}
            onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </Button>
          <p className="text-center text-xs text-slate-500">{answeredCount} of {questions.length} answered</p>
          <Button type="submit">
            {questionIndex === questions.length - 1 ? 'Review answers' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  )
}
