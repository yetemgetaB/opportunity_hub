import type { ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

const styles = {
  primary: 'bg-brand text-navy hover:brightness-110 dark-button-primary',
  dark: 'bg-navy text-white hover:bg-navy-light dark-button-dark',
  outline: 'border border-white/40 text-white hover:bg-white/10 dark-button-outline',
  secondary: 'border border-slate-200 bg-white text-navy hover:bg-slate-50 dark-button-secondary',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof styles
  to?: string
}

export default function Button({ variant = 'primary', className = '', to, children, ...props }: Props) {
  const cls = `inline-block rounded-md px-5 py-3 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${styles[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}