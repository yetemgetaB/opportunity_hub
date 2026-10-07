import { useId, type TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
  maxLength?: number
}

export default function Textarea({ label, hint, maxLength, value, className = '', ...props }: Props) {
  const id = useId()
  const length = typeof value === 'string' ? value.length : 0
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-navy">
        {label} <span className="text-red-500">*</span>
      </label>
      {hint && <p className="mb-1.5 mt-0.5 text-xs text-slate-400">{hint}</p>}
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        className={`mt-1.5 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/30 ${className}`}
        {...props}
      />
      {maxLength && (
        <p className="mt-1 text-right text-xs text-slate-400">
          {length}/{maxLength}
        </p>
      )}
    </div>
  )
}