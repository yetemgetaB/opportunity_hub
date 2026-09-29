import { useState } from 'react'
import Button from '../ui/Button'
import { NAV_LINKS } from '../../utils/constants'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#top" className="flex items-center gap-2 font-bold">
          <span className="text-brand">✦</span> Opportunity Hub
        </a>
        <nav className="hidden items-center gap-8 text-sm md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#" className="text-slate-300 hover:text-white">{l}</a>
          ))}
          <Button to="/register/student" className="py-2">Get started</Button>
        </nav>
        <button className="p-2 md:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>☰</button>
      </div>
      {open && (
        <nav className="space-y-3 px-6 pb-5 text-sm md:hidden" aria-label="Mobile navigation">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#" className="block text-slate-300">{l}</a>
          ))}
          <Button to="/register/student" className="py-2">Get started</Button>
        </nav>
      )}
    </header>
  )
}