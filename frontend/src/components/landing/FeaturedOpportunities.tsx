import { Link } from 'react-router-dom'

const featured = [
  {
    organization: 'Tesla Software Group',
    match: '97% Match',
    title: 'Software Engineering Intern',
    location: 'Palo Alto, CA · Hybrid',
    tags: ['Fall 2026', 'Remote Friendly', 'Paid Internship'],
  },
  {
    organization: 'DeepMind Robotics',
    match: '94% Match',
    title: 'Data Science Fellowship',
    location: 'London, UK · On-site',
    tags: ['12 Months', 'Post-Graduate', 'Stipend Included'],
  },
  {
    organization: 'Verdant Initiative',
    match: '89% Match',
    title: 'Community Impact Grant',
    location: 'Chicago, IL · Fieldwork',
    tags: ['Funding', 'Undergrad Eligible', 'Social Good'],
  },
  {
    organization: 'ACM National',
    match: '92% Match',
    title: 'National Hackathon 2026',
    location: 'Austin, TX · Hybrid Event',
    tags: ['Competition', 'Team of 4 Max', 'Cash Prizes'],
  },
]

export default function FeaturedOpportunities() {
  return (
    <section id="opportunities" className="border-y border-neutral-200 bg-gray-50 px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-[680px] flex-col items-center gap-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Handpicked for Excellence</p>
          <h2 className="font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">Featured Opportunities</h2>
          <p className="text-base leading-6 text-gray-500">
            Discover the highest-vetted positions and challenges designed for ambitious builders and researchers.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8">
          {featured.map((opportunity) => (
            <Link
              key={opportunity.title}
              to="/student/opportunities"
              className="flex h-full min-h-[285px] flex-col gap-5 rounded-lg border border-gray-300 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-brand/50 hover:shadow-md sm:p-6"
              aria-label={`View ${opportunity.title}`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase text-gray-500">{opportunity.organization}</span>
                  <span className="shrink-0 rounded-sm bg-brand/10 px-2 py-1 text-[11px] font-bold text-brand">
                    {opportunity.match}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold leading-6 text-navy">{opportunity.title}</h3>
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
                    <path d="M8 14s4-4.1 4-7.5a4 4 0 1 0-8 0C4 9.9 8 14 8 14Z" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="8" cy="6.5" r="1.2" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  {opportunity.location}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.tags.map((tag) => (
                  <span key={tag} className="rounded-sm border border-neutral-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-navy">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-neutral-200 pt-3 text-xs font-semibold text-navy">
                <span>View Position</span>
                <span aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link to="/student/opportunities" className="rounded-md bg-navy px-6 py-3.5 text-sm font-semibold !text-brand transition hover:bg-navy-light">
            Explore All 2,400+ Active Listings
          </Link>
        </div>
      </div>
    </section>
  )
}
