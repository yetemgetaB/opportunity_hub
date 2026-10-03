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
    <div>
      <AuthTabs
        items={[
          { label: 'Student Login', active: role === 'student', onSelect: () => setRole('student') },
          { label: 'Organization Login', active: role === 'organization', onSelect: () => setRole('organization') },
        ]}
      />
      <h2 className="mt-10 text-3xl font-bold text-navy">Welcome Back</h2>
      <p className="mt-2 text-sm text-slate-500">Please log in to continue to your {role} portal.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <TextField label={t.email} type="email" name="email" placeholder={t.emailPlaceholder} required />
        <PasswordField
          label="Password"
          name="password"
          placeholder="Enter your password"
          required
          action={<a href="#" className="text-xs font-semibold text-amber-600">Forgot Password?</a>}
        />
        <Button type="submit" className="w-full">Login</Button>
      </form>

      <div className="mt-3">
        <SocialButtons verb="Sign in" />
      </div>
      <p className="mt-8 text-center text-xs text-slate-500">
        New to Opportunity Hub?{' '}
        <Link to={t.registerTo} className="font-semibold text-amber-600">{t.registerText}</Link>
      </p>
    </div>
  )
}