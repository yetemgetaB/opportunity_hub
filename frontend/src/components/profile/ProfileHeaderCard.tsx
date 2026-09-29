import { STUDENT_SUBTITLE, STUDENT_TAGLINE, STUDENT_TITLE } from '../../utils/studentData'

export default function ProfileHeaderCard() {
  return (
    <section className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy text-lg font-bold text-white">
        {STUDENT_TITLE.split(' ').map((n) => n[0]).join('')}
      </span>
      <div>
        <h2 className="text-lg font-bold text-navy">{STUDENT_TITLE}</h2>
        <p className="mt-1 text-sm font-medium text-brand">{STUDENT_SUBTITLE}</p>
        <p className="mt-1 text-sm text-slate-500">{STUDENT_TAGLINE}</p>
      </div>
    </section>
  )
}