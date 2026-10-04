import { useState } from 'react'
import TextField, { type TextFieldProps } from './TextField'

export default function PasswordField(props: Omit<TextFieldProps, 'type'>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <TextField {...props} type={show ? 'text' : 'password'} className={`pr-12 ${props.className ?? ''}`} />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute bottom-3.5 right-3.5 text-gray-500"
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
          <path d="M2 10s2.9-5 8-5 8 5 8 5-2.9 5-8 5-8-5-8-5Z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
          {!show && <path d="m4 4 12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </button>
    </div>
  )
}