import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import PasswordField from '../../components/ui/PasswordField'
import AuthTabs from '../../components/auth/AuthTabs'
import { useAuthContext } from '../../context/AuthContext'

const copy = {
  student: {
    email: 'Email Address',
    emailPlaceholder: 'alex.mercer@stanford.edu',
    registerTo: '/register/student',
    registerText: 'Create a free student account',
  },
  organization: {
    email: 'Company Email',
    emailPlaceholder: 'hiring@acme.com',
    registerTo: '/register/organization',
    registerText: 'Create a free organization account',
  },
}

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'organization'>('student')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthContext()
  const t = copy[role]
  const locationState = location.state as {
    registrationComplete?: boolean
    accountRole?: 'student' | 'organization'
    from?: { pathname?: string }
  } | null
  const registrationState = locationState
  const isEmailVerifiedRedirect = typeof window !== 'undefined' && (
    window.location.hash.includes('type=signup') ||
    window.location.hash.includes('access_token') ||
    location.search.includes('type=signup')
  )

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = String(data.get('email') ?? '')
    const password = String(data.get('password') ?? '')
    setError('')
    setSubmitting(true)
    try {
      const user = await login(email, password)
      const intendedPath = locationState?.from?.pathname
      const roleHome = user.role === 'ORGANIZATION' ? '/organization' : user.role === 'ADMIN' ? '/admin' : '/student'
      const rolePathAllowed = user.role === 'STUDENT'
        ? !intendedPath?.startsWith('/organization') && !intendedPath?.startsWith('/admin')
        : user.role === 'ORGANIZATION'
          ? !intendedPath?.startsWith('/student') && !intendedPath?.startsWith('/admin')
          : true
      navigate(intendedPath && rolePathAllowed ? intendedPath : roleHome, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-2.5rem)] flex-col justify-between py-2">
      <AuthTabs
        items={[
          { label: 'Student Login', active: role === 'student', onSelect: () => setRole('student') },
          { label: 'Organization Login', active: role === 'organization', onSelect: () => setRole('organization') },
        ]}
      />

      <div className="mx-auto my-6 w-full max-w-96">
        {isEmailVerifiedRedirect ? (
          <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200/70 text-emerald-800">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-emerald-950">Email verified successfully!</p>
              <p className="mt-0.5 text-xs text-emerald-800">Your account is active. Enter your password below to log in.</p>
            </div>
          </div>
        ) : registrationState?.registrationComplete ? (
          <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-800">
            Your {registrationState.accountRole ?? 'user'} account was created. Sign in to continue to profile setup.
          </p>
        ) : null}
        <header className="mb-6">
          <h2 className="font-display text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-500">Please log in to continue to your {role} portal.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label={t.email} type="email" name="email" placeholder={t.emailPlaceholder} required />
          <PasswordField
            label="Password"
            name="password"
            placeholder="Enter your password"
            required
          />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={submitting} className="min-h-14 w-full rounded-lg py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Signing in…' : 'Login'}
          </Button>
        </form>

      </div>

      <p className="text-center text-sm text-gray-500">
        New to Opportunity Hub?{' '}
        <Link to={t.registerTo} className="auth-page-link font-semibold text-brand hover:decoration-brand">
          {t.registerText}
        </Link>
      </p>
    </div>
  )
}
