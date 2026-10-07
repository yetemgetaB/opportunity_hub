import { useRef, useState } from 'react'
import Icon from '../ui/Icon'

type Props = {
  label: string
  items: string[]
  required?: boolean
  onAdd: (value: string) => void
  onRemove: (index: number) => void
}

export default function OpportunitySkillTags({ label, items, required, onAdd, onRemove }: Props) {
  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState('')
  const cancelled = useRef(false)

  function commit() {
    const skill = value.trim()
    if (skill) onAdd(skill)
    setValue('')
    setAdding(false)
  }

  return (
    <div>
      <p className="text-xs font-semibold text-slate-900">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <div className="mt-2 flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-neutral-200 p-3">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs ${
              required
                ? 'border border-amber-500 bg-amber-500/10 font-semibold text-slate-900'
                : 'bg-slate-800/5 font-normal text-slate-900'
            }`}
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${item}`}
              className="text-slate-500 hover:text-red-500"
            >
              <Icon name="x" className="size-3" />
            </button>
          </span>
        ))}
        {adding ? (
          <input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commit()
              }
              if (event.key === 'Escape') {
                cancelled.current = true
                setValue('')
                setAdding(false)
              }
            }}
            onBlur={() => {
              if (cancelled.current) {
                cancelled.current = false
                return
              }
              commit()
            }}
            placeholder="Type and press Enter"
            className="min-w-32 flex-1 rounded-sm border border-amber-500 px-2.5 py-1 text-xs text-slate-900 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              cancelled.current = false
              setAdding(true)
            }}
            className="inline-flex items-center gap-1 rounded-sm bg-slate-800/5 px-2.5 py-1 text-xs font-semibold text-slate-900 transition hover:bg-slate-800/10"
          >
            <Icon name="plus" className="size-3" />
            Add Skill
          </button>
        )}
      </div>
    </div>
  )
}
