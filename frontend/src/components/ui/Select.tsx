import { useId, type SelectHTMLAttributes } from 'react'
import Icon from './Icon'

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: string[]
  placeholder?: string
  required?: boolean
}

export default function Select({ label, options, placeholder, required, className = '', ...props }: Props) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-navy">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative mt-1.5">
        <select
          id={id}
          required={required}
          defaultValue=""
          className={`w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 ${
            props.value === '' || props.defaultValue === undefined ? '' : ''
          } text-navy ${className}`}
          {...props}
        >
          <option value="" disabled className="text-slate-400">
            {placeholder ?? `Select ${label.toLowerCase()}`}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  )
}