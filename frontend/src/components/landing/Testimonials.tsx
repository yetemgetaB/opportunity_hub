import SectionHeading from '../ui/SectionHeading'
import { TESTIMONIALS } from '../../utils/constants'

export default function Testimonials() {
  return (
    <section className="bg-navy-light py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading dark eyebrow="Success stories" title="Student testimonials" subtitle="Hear from students who found their next step." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-xl bg-white p-6 text-navy">
              <blockquote className="text-sm leading-6 text-slate-600">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-sm font-semibold">
                {t.name}
                <span className="block font-normal text-slate-500">{t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}