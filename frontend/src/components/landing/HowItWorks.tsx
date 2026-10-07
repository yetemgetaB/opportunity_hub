import { STEPS } from '../../utils/constants'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto flex max-w-[680px] flex-col items-center gap-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Process</p>
          <h2 className="font-display text-3xl font-bold leading-tight text-navy sm:text-4xl">How It Works</h2>
          <p className="text-base leading-6 text-gray-500">
            We bridge the gap between motivated students and top-tier opportunities through simple, programmatic steps.
          </p>
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-3 lg:mt-16 lg:gap-8">
          {STEPS.map((step) => (
            <li key={step.n} className="flex flex-col gap-6 rounded-lg border border-neutral-200 bg-gray-50 p-7 sm:p-8">
              <span className="font-display text-3xl font-extrabold text-brand">{step.n}</span>
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-xl font-bold text-navy">{step.title}</h3>
                <p className="text-sm leading-6 text-gray-500">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
