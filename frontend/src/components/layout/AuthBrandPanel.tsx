const features: [string, string, string][] = [
  ['✦', 'Precision AI Matching', 'Find positions custom fit to your coursework and projects.'],
  ['▤', 'Smart Standardized Assessments', 'Showcase coding ability with fast context-aware evaluations.'],
  ['⌕', 'Vocal Query Capabilities', 'Browse openings instantly using voice or plain-text searches.'],
]

export default function AuthBrandPanel() {
  return (
    <section className="hidden flex-col justify-between bg-navy p-12 text-white md:flex">
      <p className="text-xl font-bold">
        Opportunity <span className="text-brand">Hub</span>
      </p>
      <div>
        <h1 className="max-w-md text-4xl font-bold leading-tight">AI-Powered Campus Opportunity Hub</h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
          Connecting student potential with premier organizations through streamlined AI discovery, matching,
          and integrated custom smart assessments.
        </p>
      </div>
      <ul className="space-y-5">
        {features.map(([icon, title, text]) => (
          <li key={title} className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10 text-brand" aria-hidden="true">
              {icon}
            </span>
            <div className="text-sm">
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-slate-400">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">© 2026 Opportunity Hub. All rights reserved.</p>
    </section>
  )
}