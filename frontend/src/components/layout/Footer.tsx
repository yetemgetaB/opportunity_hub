import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#how-it-works' },
      { label: 'Opportunities', href: '/opportunities' },
      { label: 'For Students', href: '/#students' },
      { label: 'For Organizations', href: '/#organizations' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#top' },
      { label: 'Careers', href: '/#opportunities' },
      { label: 'Stories', href: '/#testimonials' },
      { label: 'Press', href: '/#organizations' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/#how-it-works' },
      { label: 'Contact Us', href: '/register/organization' },
      { label: 'Login', href: '/login' },
      { label: 'Create an Account', href: '/register/student' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-blue-950 bg-navy px-5 pb-8 pt-14 text-gray-300 sm:px-8 sm:pt-16 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-xs">
            <Link to="/" className="font-display text-lg font-bold text-white">Opportunity Hub</Link>
            <p className="mt-4 text-xs leading-5 text-gray-300">
              Connecting students and organizations across university ecosystems.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={`${column.title} footer links`} className="flex flex-col items-start gap-4">
              <h2 className="font-display text-sm font-bold uppercase text-white">{column.title}</h2>
              {column.links.map((link) => (
                link.href.startsWith('/#') ? (
                  <a key={link.label} href={link.href} className="text-xs transition hover:text-brand">{link.label}</a>
                ) : (
                  <Link key={link.label} to={link.href} className="text-xs transition hover:text-brand">{link.label}</Link>
                )
              ))}
            </nav>
          ))}
        </div>
        <div className="mt-12 border-t border-blue-950 pt-7 text-xs text-gray-300">
          © 2025 Opportunity Hub Technologies Inc. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
