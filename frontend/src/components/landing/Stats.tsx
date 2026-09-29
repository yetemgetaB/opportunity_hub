import { STATS } from '../../utils/constants'

export default function Stats() {
  return (
    <section className="bg-navy py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
        {STATS.map(([value, label]) => (
          <div key={label}>
            <p className="text-4xl font-bold text-brand">{value}</p>
            <p className="mt-1 text-sm text-slate-300">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}