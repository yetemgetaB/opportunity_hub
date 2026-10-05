import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import PasswordField from '../../components/ui/PasswordField'
import AuthTabs from '../../components/auth/AuthTabs'
import { getDemoLoginHelp } from '../../services/authService'
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
  const demoAccounts = getDemoLoginHelp()

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
        {registrationState?.registrationComplete && (
          <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-800">
            Your {registrationState.accountRole ?? 'user'} account was created. Sign in to continue to profile setup.
          </p>
        )}
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
            action={<span className="cursor-pointer text-xs font-semibold text-brand">Forgot Password?</span>}
          />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={submitting} className="min-h-14 w-full rounded-lg py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? 'Signing in…' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 rounded-lg border border-neutral-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-navy">Demo accounts</p>
          <div className="mt-2 space-y-2 text-[11px] leading-4 text-slate-600">
            {demoAccounts.map((account) => (
              <p key={account.email}>
                {account.role === 'STUDENT' ? 'Student' : 'Organization'}: <code>{account.email}</code>
                <br />Password: <code>{account.password}</code>
              </p>
            ))}
          </div>
        </div>
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
