import type { ApplicantProfileDetail } from '../../types/organization'

export default function ApplicantProfileHeader({ a }: { a: ApplicantProfileDetail }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-navy text-lg font-bold text-white">
          {a.initials}
        </span>
        <div>
          <h2 className="text-lg font-bold text-navy">{a.name}</h2>
          <p className="text-sm text-slate-500">
            {a.university} · {a.track}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{a.year}</span>
    </div>
  )
}