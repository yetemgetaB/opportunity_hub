import { Link } from 'react-router-dom'

const features: [string, string, string][] = [
  ['◉', 'Precision AI Matching', 'Find positions custom fit to your coursework and projects.'],
  ['▤', 'Smart Standardized Assessments', 'Showcase coding ability with fast context-aware evaluations.'],
  ['⌕', 'Vocal Query Capabilities', 'Browse openings instantly using voice or plain-text searches.'],
]

export default function AuthBrandPanel() {
  return (
    <section className="hidden min-h-screen flex-col justify-between bg-navy p-10 text-white md:flex lg:p-12 xl:p-16">
      <Link to="/" className="font-display text-3xl font-bold tracking-tight">
        <span className="text-white">Opportunity </span>
        <span className="text-brand">Hub</span>
      </Link>
      <div className="my-12">
        <h1 className="max-w-lg font-display text-4xl font-bold leading-[1.1] lg:text-5xl">
          AI-Powered Campus Opportunity Hub
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-white/40 lg:text-lg">
          Connecting student potential with premier organizations through streamlined AI discovery, matching, and integrated custom smart assessments.
        </p>
      </div>
      <ul className="space-y-5">
        {features.map(([icon, title, text]) => (
          <li key={title} className="flex items-center gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/5 text-lg text-brand" aria-hidden="true">
              {icon}
            </span>
            <div>
              <p className="text-base font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-white/40">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-xs text-white/25">© 2026 Opportunity Hub. All rights reserved.</p>
    </section>
  )
}