import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import TextField from '../ui/TextField'
import PasswordField from '../ui/PasswordField'
import AuthTabs from './AuthTabs'
import SocialButtons from './SocialButtons'

const copy = {
  student: {
    name: 'Full Name',
    namePlaceholder: 'Alex Mercer',
    email: 'Email Address',
    emailPlaceholder: 'alex.mercer@stanford.edu',
  },
  organization: {
    name: 'Company Name',
    namePlaceholder: 'Acme Inc.',
    email: 'Company Email',
    emailPlaceholder: 'hiring@acme.com',
  },
}

export default function RegisterForm({ role }: { role: 'student' | 'organization' }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const isStudent = role === 'student'
  const t = copy[role]

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (data.get('password') !== data.get('confirm')) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    // TODO: call authService.register({ role, ... }) here
    navigate('/login')
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
      <p className="mt-2 text-sm text-gray-500">
        {isStudent
          ? 'Join in under a minute and start matching with openings.'
          : 'Post opportunities and start reaching student talent.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <TextField label={t.name} name="name" placeholder={t.namePlaceholder} required className="bg-gray-50 !py-2.5" />
        <TextField label={t.email} type="email" name="email" placeholder={t.emailPlaceholder} required className="bg-gray-50 !py-2.5" />
        <PasswordField label="Password" name="password" placeholder="At least 8 characters" minLength={8} required className="bg-gray-50 !py-2.5" />
        <PasswordField label="Confirm Password" name="confirm" placeholder="Re-enter your password" required className="bg-gray-50 !py-2.5" />
        <label className="flex items-center gap-2 text-xs leading-5 text-gray-500">
          <input type="checkbox" required className="size-4 accent-brand" />
          <span>
            I agree to the <a href="#terms" className="font-medium text-brand underline decoration-brand/50 underline-offset-2 hover:decoration-brand">Terms of Service</a> and{' '}
            <a href="#privacy" className="font-medium text-brand underline decoration-brand/50 underline-offset-2 hover:decoration-brand">Privacy Policy</a>.
          </span>
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="min-h-14 w-full rounded-lg text-base font-bold">Create Account</Button>
      </form>

      <div className="mt-3">
        <SocialButtons verb="Sign up" />
      </div>
      <p className="mt-3 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="auth-page-link font-semibold text-brand hover:decoration-brand">Log in instead</Link>
      </p>
    </div>
  )
}