import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  action?: ReactNode
}

export default function TextField({ label, action, required, disabled, className = '', ...props }: TextFieldProps) {
  const id = useId()
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-navy">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {action}
      </div>
      <input
        id={id}
        required={required}
        disabled={disabled}
        className={`w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:text-slate-400 ${className}`}
        {...props}
      />
    </div>
  )
}