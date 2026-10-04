import { TESTIMONIALS } from '../../utils/constants'

export default function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-neutral-200 bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-[680px] flex-col items-center gap-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Success Stories</p>
          <h2 className="font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">Student Testimonials</h2>
          <p className="text-base leading-6 text-gray-500">
            Hear how students found meaningful opportunities and took the next step in their journey.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-16 lg:gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <figure key={testimonial.name} className="flex h-full flex-col justify-between gap-6 rounded-lg border border-neutral-200 bg-gray-50 p-6 sm:p-8">
              <blockquote className="text-base leading-6 text-navy">“{testimonial.quote}”</blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-200 text-sm font-bold text-navy" aria-hidden="true">
                  {testimonial.name.split(' ').map((part) => part[0]).join('')}
                </span>
                <span>
                  <span className="block font-display text-sm font-semibold text-navy">{testimonial.name}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">{testimonial.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
