import type { ReactNode } from 'react'
import Icon from '../ui/Icon'

type OpportunityFormSectionProps = {
  icon: 'info' | 'check' | 'calendar'
  title: string
  children: ReactNode
}

export function OpportunityFormSection({ icon, title, children }: OpportunityFormSectionProps) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-8">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="size-4 text-amber-500" />
        <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  )
}

type OpportunityTextareaProps = {
  label: string
  placeholder: string
  rows: number
  required?: boolean
  value: string
  onChange: (value: string) => void
}

export function OpportunityTextarea({
  label,
  placeholder,
  rows,
  required,
  value,
  onChange,
}: OpportunityTextareaProps) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-900">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <textarea
        required={required}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block w-full resize-y rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      />
    </label>
  )
}
