import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import PasswordField from '../../components/ui/PasswordField'
import AuthTabs from '../../components/auth/AuthTabs'
import SocialButtons from '../../components/auth/SocialButtons'

const copy = {
  student: {
    email: 'Email Address',
    emailPlaceholder: 'alex.mercer@stanford.edu',
    registerTo: '/register/student',
    registerText: 'Create a free student account',
    home: '/student',
  },
  organization: {
    email: 'Company Email',
    emailPlaceholder: 'hiring@acme.com',
    registerTo: '/register/organization',
    registerText: 'Create a free organization account',
    home: '/organization',
  },
}

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'organization'>('student')
  const navigate = useNavigate()
  const t = copy[role]

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // TODO: call authService.login({ role, ... }), then redirect based on the user's role
    navigate(t.home)
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
          <Button type="submit" className="min-h-14 w-full rounded-lg py-3.5 text-base font-bold">Login</Button>
        </form>

        <div className="mt-3">
          <SocialButtons verb="Sign in" />
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
