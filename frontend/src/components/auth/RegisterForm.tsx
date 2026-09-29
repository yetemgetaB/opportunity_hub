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
    <div>
      <AuthTabs
        items={[
          { label: 'Student Register', active: isStudent, onSelect: () => navigate('/register/student') },
          { label: 'Organization Register', active: !isStudent, onSelect: () => navigate('/register/organization') },
        ]}
      />
      <h2 className="mt-8 text-3xl font-bold text-navy">Create Your Account</h2>
      <p className="mt-2 text-sm text-slate-500">
        {isStudent
          ? 'Join in under a minute and start matching with openings.'
          : 'Post opportunities and start reaching student talent.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <TextField label={t.name} name="name" placeholder={t.namePlaceholder} required />
        <TextField label={t.email} type="email" name="email" placeholder={t.emailPlaceholder} required />
        <PasswordField label="Password" name="password" placeholder="At least 8 characters" minLength={8} required />
        <PasswordField label="Confirm Password" name="confirm" placeholder="Re-enter your password" required />
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" required />
          <span>
            I agree to the <a href="#" className="text-amber-600">Terms of Service</a> and{' '}
            <a href="#" className="text-amber-600">Privacy Policy</a>.
          </span>
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full">Create Account</Button>
      </form>

      <div className="mt-3">
        <SocialButtons verb="Sign up" />
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-amber-600">Log in instead</Link>
      </p>
    </div>
  )
}