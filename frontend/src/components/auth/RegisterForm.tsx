import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import TextField from '../ui/TextField'
import PasswordField from '../ui/PasswordField'
import AuthTabs from './AuthTabs'
import { ApiError } from '../../services/api'
import { registerAccount } from '../../services/authService'

const copy = {
  student: {
    firstNamePlaceholder: 'Alex',
    middleNamePlaceholder: 'Jordan',
    lastNamePlaceholder: 'Mercer',
    email: 'Email Address',
    emailPlaceholder: 'alex.mercer@stanford.edu',
    description: 'Create your student account to find opportunities that fit your goals.',
  },
  organization: {
    firstNamePlaceholder: 'Alex',
    middleNamePlaceholder: 'Jordan',
    lastNamePlaceholder: 'Mercer',
    email: 'Company Email',
    emailPlaceholder: 'hiring@acme.com',
    description: 'Create an account to connect your organization with student talent.',
  },
}

type FieldName = 'firstName' | 'middleName' | 'lastName' | 'email' | 'password' | 'confirm'
type FieldErrors = Partial<Record<FieldName, string>>

const passwordRules = [
  { label: 'At least 8 characters', test: (value: string) => value.length >= 8 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
  { label: 'One special character', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
]

function validateName(value: string, required: boolean) {
  const name = value.trim()
  if (!name) return required ? 'This field is required.' : undefined
  if (name.length > 80 || !/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(name)) {
    return 'Enter a name using letters, spaces, apostrophes, periods, or hyphens (up to 80 characters).'
  }
  return undefined
}

function registrationErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'We could not create your account. Please try again.'
  if (error.status === 0) return 'Unable to reach the service. Check your connection and try again.'
  if (error.status === 409) return 'An account with this email already exists.'
  if (error.status === 400) return 'Some account details could not be accepted. Review them and try again.'
  return 'We could not create your account right now. Please try again later.'
}

export default function RegisterForm({ role }: { role: 'student' | 'organization' }) {
  const navigate = useNavigate()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isStudent = role === 'student'
  const t = copy[role]

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const firstName = String(data.get('firstName') ?? '')
    const middleName = String(data.get('middleName') ?? '')
    const lastName = String(data.get('lastName') ?? '')
    const email = String(data.get('email') ?? '').trim()
    const submittedPassword = String(data.get('password') ?? '')
    const confirmation = String(data.get('confirm') ?? '')
    const nextErrors: FieldErrors = {}

    const firstNameError = validateName(firstName, true)
    const middleNameError = validateName(middleName, false)
    const lastNameError = validateName(lastName, true)
    if (firstNameError) nextErrors.firstName = firstNameError
    if (middleNameError) nextErrors.middleName = middleNameError
    if (lastNameError) nextErrors.lastName = lastNameError
    if (!email) nextErrors.email = 'Email address is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (passwordRules.some((rule) => !rule.test(submittedPassword))) {
      nextErrors.password = 'Meet all password requirements before continuing.'
    }
    if (!confirmation) nextErrors.confirm = 'Please confirm your password.'
    else if (submittedPassword !== confirmation) nextErrors.confirm = 'Passwords do not match.'

    setErrors(nextErrors)
    setError('')
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      await registerAccount({
        email,
        password: submittedPassword,
        firstName: firstName.trim(),
        ...(middleName.trim() ? { middleName: middleName.trim() } : {}),
        lastName: lastName.trim(),
        role: isStudent ? 'STUDENT' : 'ORGANIZATION',
      })
      navigate('/login', {
        replace: true,
        state: {
          registrationComplete: true,
          accountRole: role,
        },
      })
    } catch (cause) {
      setError(registrationErrorMessage(cause))
    } finally {
      setSubmitting(false)
    }
  }

  function fieldError(name: FieldName) {
    return errors[name] && (
      <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-red-600">{errors[name]}</p>
    )
  }

  return (
    <div className="mx-auto w-full max-w-96 py-1">
      <AuthTabs
        items={[
          { label: 'Student Register', active: isStudent, onSelect: () => navigate('/register/student') },
          { label: 'Organization Register', active: !isStudent, onSelect: () => navigate('/register/organization') },
        ]}
      />
      <h2 className="mt-4 font-display text-3xl font-bold text-slate-900">Create Your Account</h2>
      <p className="mt-2 text-sm text-gray-500">{t.description}</p>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <TextField
              label="First Name"
              name="firstName"
              autoComplete="given-name"
              placeholder={t.firstNamePlaceholder}
              required
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              className="bg-gray-50 !py-2.5"
              onChange={() => setErrors((current) => ({ ...current, firstName: undefined }))}
            />
            {fieldError('firstName')}
          </div>
          <div>
            <TextField
              label="Middle Name"
              name="middleName"
              autoComplete="additional-name"
              placeholder={t.middleNamePlaceholder}
              aria-invalid={Boolean(errors.middleName)}
              aria-describedby={errors.middleName ? 'middleName-error' : undefined}
              className="bg-gray-50 !py-2.5"
              onChange={() => setErrors((current) => ({ ...current, middleName: undefined }))}
            />
            {fieldError('middleName')}
          </div>
        </div>
        <div>
          <TextField
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            placeholder={t.lastNamePlaceholder}
            required
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            className="bg-gray-50 !py-2.5"
            onChange={() => setErrors((current) => ({ ...current, lastName: undefined }))}
          />
          {fieldError('lastName')}
        </div>
        <div>
          <TextField
            label={t.email}
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t.emailPlaceholder}
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="bg-gray-50 !py-2.5"
            onChange={() => setErrors((current) => ({ ...current, email: undefined }))}
          />
          {fieldError('email')}
        </div>
        <div>
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a secure password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setErrors((current) => ({ ...current, password: undefined }))
            }}
            required
            aria-invalid={Boolean(errors.password)}
            aria-describedby="password-requirements"
            className="bg-gray-50 !py-2.5"
          />
          <ul id="password-requirements" className="mt-2 grid gap-x-3 gap-y-1 text-[11px] text-slate-500 sm:grid-cols-2">
            {passwordRules.map((rule) => (
              <li key={rule.label} className={rule.test(password) ? 'font-medium text-emerald-700' : ''}>
                <span aria-hidden="true">{rule.test(password) ? '✓' : '•'}</span> {rule.label}
              </li>
            ))}
          </ul>
          {fieldError('password')}
        </div>
        <div>
          <PasswordField
            label="Confirm Password"
            name="confirm"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            required
            aria-invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? 'confirm-error' : undefined}
            className="bg-gray-50 !py-2.5"
            onChange={() => setErrors((current) => ({ ...current, confirm: undefined }))}
          />
          {fieldError('confirm')}
        </div>
        {!isStudent && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">
            Organization accounts may require verification before you can publish opportunities.
          </p>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          disabled={submitting}
          className="min-h-12 w-full rounded-lg text-base font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="auth-page-link font-semibold text-brand hover:decoration-brand">Log in instead</Link>
      </p>
    </div>
  )
}