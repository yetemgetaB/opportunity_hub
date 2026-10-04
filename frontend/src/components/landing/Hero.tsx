import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const quickSearches = ['Internships', 'Scholarships', 'Remote', 'Hackathons', 'Competitions']

const opportunities = [
  {
    company: 'Spotify',
    label: 'Remote',
    title: 'Product Design Intern',
    location: 'New York, NY',
    details: ['Full-time', 'Summer 2026'],
    position: 'lg:left-[4%] lg:top-[5%] lg:w-[74%] lg:-rotate-2',
  },
  {
    company: 'Google',
    label: 'Scholarship',
    title: 'Google Summer of Code',
    location: 'Open Worldwide',
    details: ['Remote', 'Undergrad'],
    position: 'lg:right-[2%] lg:top-[23%] lg:w-[68%] lg:rotate-2',
  },
  {
    company: 'Rhodes Trust',
    label: 'Scholarship',
    title: 'Rhodes Scholarship',
    location: 'Oxford, United Kingdom',
    details: ['Fully Funded', 'Graduate Study'],
    position: 'lg:left-[7%] lg:bottom-[8%] lg:w-[73%] lg:rotate-1',
  },
  {
    company: 'MIT',
    label: '$5,000 Prize',
    title: 'MIT Hackathon 2026',
    location: 'Cambridge, MA',
    details: ['Competition', '48 Hours'],
    position: 'lg:right-[5%] lg:bottom-[1%] lg:w-[67%] lg:-rotate-2',
  },
  {
    company: 'Stripe',
    label: 'Remote',
    title: 'Backend Software Engineer',
    location: 'Remote',
    details: ['Full-time'],
    position: 'lg:right-0 lg:top-[51%] lg:w-[42%] lg:rotate-3',
  },
]

function SearchIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.5 15.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function search(event?: FormEvent<HTMLFormElement>, term = query) {
    event?.preventDefault()
    const value = term.trim()
    navigate(value ? `/student/opportunities?search=${encodeURIComponent(value)}` : '/student/opportunities')
  }

  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <div className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full bg-brand opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-white opacity-[0.04] blur-3xl" />
      <div className="pointer-events-none absolute left-8 top-36 hidden h-0.5 w-36 bg-brand opacity-20 lg:block" />
      <div className="pointer-events-none absolute right-16 top-28 hidden h-0.5 w-44 bg-white opacity-10 lg:block" />
      <div className="pointer-events-none absolute left-[9%] top-14 size-2.5 rounded-full bg-brand opacity-70" />
      <div className="pointer-events-none absolute right-[11%] top-16 size-2.5 rounded-full bg-brand opacity-60" />

      <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-16 sm:px-8 sm:pt-20 lg:grid lg:min-h-[700px] lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:gap-8 lg:px-20 lg:py-16">
        <div className="relative z-10 max-w-[590px]">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-[2.75rem] font-extrabold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              Find Opportunities That Move Your Future Forward.
            </h1>
            <p className="max-w-[620px] text-base leading-7 text-gray-300 sm:text-xl sm:leading-8">
              Discover internships, scholarships, hackathons, and thousands of opportunities from top organizations — all in one place.
            </p>
          </div>

          <div className="mt-9 flex flex-col gap-4">
            <form onSubmit={(event) => search(event)} className="flex min-h-[72px] items-center gap-3 rounded-[20px] border border-neutral-200 bg-white p-2.5 shadow-[0_18px_36px_rgba(0,0,0,0.15),0_8px_18px_rgba(0,0,0,0.08)]">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy text-white">
                <SearchIcon className="size-5" />
              </span>
              <label className="min-w-0 flex-1">
                <span className="sr-only">Search opportunities</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-gray-500 sm:text-base"
                  placeholder="Search internships, scholarships, hackathons..."
                />
              </label>
              <button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-navy transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                <SearchIcon className="size-4" />
                <span>Search</span>
              </button>
            </form>
            <div className="flex flex-wrap gap-2.5">
              {quickSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => search(undefined, term)}
                  className="rounded-full border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:border-brand hover:bg-brand/10"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-10 grid gap-3 sm:grid-cols-2 lg:mt-0 lg:h-[540px] lg:grid-cols-1 lg:gap-0">
          {opportunities.map((opportunity) => (
            <Link
              key={opportunity.company}
              to="/student/opportunities"
              className={`relative z-20 flex flex-col gap-2.5 rounded-xl border border-neutral-200 bg-white p-3.5 text-navy shadow-[0_12px_24px_rgba(0,0,0,0.12),0_4px_10px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 sm:p-4 lg:absolute lg:z-auto ${opportunity.position}`}
              aria-label={`Search for ${opportunity.title}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase text-gray-500">{opportunity.company}</span>
                <span className="rounded-full bg-brand px-2 py-1 text-[10px] font-bold text-navy">{opportunity.label}</span>
              </div>
              <h2 className="font-display text-base font-bold leading-5 sm:text-lg">{opportunity.title}</h2>
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
                  <path d="M8 14s4-4.1 4-7.5a4 4 0 1 0-8 0C4 9.9 8 14 8 14Z" stroke="currentColor" strokeWidth="1.4" />
                  <circle cx="8" cy="6.5" r="1.2" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                {opportunity.location}
              </p>
              <div className="flex flex-wrap gap-2">
                {opportunity.details.map((detail, index) => (
                  <span key={detail} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${index === 0 ? 'bg-navy text-white' : 'bg-gray-100 text-navy'}`}>
                    {detail}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
