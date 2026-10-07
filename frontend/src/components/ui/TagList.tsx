import { useState } from 'react'
import Icon from './Icon'

type Props = {
  label: string
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  addLabel: string
}

export default function TagList({ label, items, onAdd, onRemove, addLabel }: Props) {
  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState('')

  function commit() {
    const v = value.trim()
    if (v) onAdd(v)
    setValue('')
    setAdding(false)
  }

  return (
    <div>
      <p className="text-xs font-semibold text-navy">{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-navy"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${item}`}
              className="text-slate-400 hover:text-red-500"
            >
              <Icon name="x" className="h-3 w-3" />
            </button>
          </span>
        ))}

        {adding ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') { setValue(''); setAdding(false) }
            }}
            onBlur={commit}
            placeholder="Type and press Enter"
            className="w-36 rounded-full border border-brand px-3 py-1.5 text-xs outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-brand px-3 py-1.5 text-xs font-semibold text-brand hover:bg-amber-50"
          >
            <Icon name="plus" className="h-3 w-3" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  )
}