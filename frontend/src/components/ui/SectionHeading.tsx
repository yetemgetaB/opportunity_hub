type Props = { eyebrow: string; title: string; subtitle?: string; dark?: boolean }

export default function SectionHeading({ eyebrow, title, subtitle, dark }: Props) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-bold sm:text-4xl ${dark ? 'text-white' : 'text-navy'}`}>{title}</h2>
      {subtitle && <p className={`mt-3 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{subtitle}</p>}
    </div>
  )
}