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
    emailPlaceholder: 'hiring@safaricom.et',
    registerTo: '/register/organization',
    registerText: 'Create a free organization account',
  },
}

const DEMO_ACCOUNTS = [
  { role: 'student' as const, label: '🎓 Student Demo (Yetem)', email: 'yetemgetabekele@gmail.com' },
  { role: 'organization' as const, label: '🏢 Org Recruiter (Safaricom)', email: 'unity@corporate.com' },
  { role: 'student' as const, label: '🛡️ Admin Account', email: 'yetemgetabekele1@gmail.com' },
]

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'organization'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
          <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900">i</span>
            <div>
              <p className="font-semibold">Check your inbox to verify your email</p>
              <p className="mt-0.5 text-xs text-amber-800">Click the confirmation link sent to your email, then return here to log in.</p>
            </div>
          </div>
        ) : null}

        <header className="mb-5">
          <h2 className="font-display text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="mt-1.5 text-sm text-gray-500">Please log in to continue to your {role} portal.</p>
        </header>

        {/* Demo Fast Fill Section */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Quick Demo Accounts</p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setRole(acc.role)
                  setEmail(acc.email)
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition border ${
                  email === acc.email
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label={t.email}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            required
          />
          <PasswordField
            label="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
