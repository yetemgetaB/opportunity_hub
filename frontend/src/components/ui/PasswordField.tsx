import { useState } from 'react'
import TextField, { type TextFieldProps } from './TextField'

export default function PasswordField(props: Omit<TextFieldProps, 'type'>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <TextField {...props} type={show ? 'text' : 'password'} className="pr-16" />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute bottom-3 right-3 text-xs font-semibold text-slate-500"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}