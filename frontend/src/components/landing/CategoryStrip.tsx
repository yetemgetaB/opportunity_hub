import { Link } from 'react-router-dom'

const categories = [
  { label: 'Internships', search: 'Internship', icon: 'M3 7h18v13H3z M7 7V4h10v3 M3 11h18 M10 11v2h4v-2' },
  { label: 'Scholarships', search: 'Scholarship', icon: 'M2 8 12 3l10 5-10 5L2 8Z M6 10v5c3 2 9 2 12 0v-5 M22 8v6' },
  { label: 'Jobs', search: 'job', icon: 'M4 7h16v14H4z M8 7V4h8v3 M4 12h16 M10 12v2h4v-2' },
  { label: 'Hackathons', search: 'Hackathon', icon: 'm8 5-5 7 5 7 M16 5l5 7-5 7 M14 3l-4 18' },
  { label: 'Training Programs', search: 'Training', icon: 'M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h5' },
  { label: 'Competitions', search: 'Competition', icon: 'M8 21h8 M12 17v4 M7 4h10v6a5 5 0 0 1-10 0V4Z M7 6H4v2a4 4 0 0 0 4 4 M17 6h3v2a4 4 0 0 1-4 4' },
  { label: 'Volunteer', search: 'Volunteer', icon: 'M20.8 8.6c0 4.1-8.8 10-8.8 10s-8.8-5.9-8.8-10A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z' },
]

export default function CategoryStrip() {
  return (
    <nav aria-label="Browse opportunity categories" className="border-b border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-4 px-5 py-6 sm:grid-cols-3 sm:px-8 md:grid-cols-4 lg:grid-cols-7 lg:px-10">
        {categories.map((category) => (
          <Link
            key={category.label}
            to={`/student/opportunities?search=${encodeURIComponent(category.search)}`}
            className="flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-amber-700"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-gray-50 text-navy">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
                <path d={category.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>{category.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
