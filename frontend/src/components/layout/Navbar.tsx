import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

const links = [
  { label: 'Opportunities', href: '#opportunities' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Students', href: '#students' },
  { label: 'For Organizations', href: '#organizations' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-30 border-b border-blue-950 bg-navy text-white">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-20">
        <Link to="/" className="shrink-0 font-display text-xl font-bold tracking-tight" aria-label="Opportunity Hub home">
          <span className="text-white">Opportunity </span>
          <span className="text-brand">Hub</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-gray-300 transition hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-6 lg:flex">
          <Link to="/login" className="text-sm font-semibold text-white hover:text-brand">Login</Link>
          <Button to="/register/student" className="px-6 py-3.5">Get Started</Button>
        </div>

        <button
          type="button"
          className="grid size-10 shrink-0 place-items-center rounded-md border border-white/20 text-xl lg:hidden"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? '×' : '☰'}
        </button>
      </div>
      {open && (
        <nav className="absolute inset-x-0 top-full space-y-1 border-t border-blue-950 bg-navy px-5 pb-5 pt-3 shadow-lg lg:hidden" aria-label="Mobile navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-gray-300 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-5 pt-3">
            <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold text-white">Login</Link>
            <Button to="/register/student" className="px-5 py-3">Get Started</Button>
          </div>
        </nav>
      )}
    </header>
  )
}
