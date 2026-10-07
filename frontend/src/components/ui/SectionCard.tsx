import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'

type Props = { icon: IconName; title: string; children: ReactNode }

export default function SectionCard({ icon, title, children }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-brand">
          <Icon name={icon} className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-sm font-bold text-navy">{title}</h2>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}