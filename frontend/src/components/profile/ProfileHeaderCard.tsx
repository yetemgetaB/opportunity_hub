import { STUDENT_SUBTITLE, STUDENT_TAGLINE, STUDENT_TITLE } from '../../utils/studentData'

export default function ProfileHeaderCard() {
  return (
    <section className="flex items-center gap-5 rounded-xl border border-neutral-200 bg-white p-6 sm:p-8">
      <div className="relative shrink-0">
        <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-neutral-200 bg-slate-50 text-xl font-semibold text-navy sm:h-24 sm:w-24">
          {STUDENT_TITLE.split(' ').map((n) => n[0]).join('')}
        </span>
        <span aria-hidden="true" className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-brand text-navy">
          <span className="text-xs font-bold">✎</span>
        </span>
      </div>
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-bold text-slate-900">{STUDENT_TITLE}</h2>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">{STUDENT_SUBTITLE}</p>
        <p className="mt-2 text-sm leading-6 text-gray-500">{STUDENT_TAGLINE}</p>
      </div>
    </section>
  )
}