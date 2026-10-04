import { STATS } from '../../utils/constants'

export default function Stats() {
  return (
    <section aria-label="Opportunity Hub impact" className="bg-navy px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-8">
        {STATS.map(([value, label]) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <p className="font-display text-4xl font-extrabold tracking-tight text-brand sm:text-5xl">{value}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-300 sm:text-sm">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
