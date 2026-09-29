import SectionHeading from '../ui/SectionHeading'
import { STEPS } from '../../utils/constants'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="Simple by design" title="How it works" subtitle="Three steps from your goals to your next opportunity." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <article key={s.n} className="rounded-xl border border-slate-200 bg-white p-6">
              <span className="text-2xl font-bold text-brand">{s.n}</span>
              <h3 className="mt-4 text-lg font-bold text-navy">{s.title}</h3>
              <p className="mt-2 text-slate-600">{s.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}