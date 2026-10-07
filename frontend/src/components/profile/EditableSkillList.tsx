import { useState } from 'react'
import Icon from '../ui/Icon'

type Props = {
  label: string
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  addLabel: string
}

export default function EditableSkillList({ label, items, onAdd, onRemove, addLabel }: Props) {
  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState('')

  function commit() {
    const skill = value.trim()
    if (skill) onAdd(skill)
    setValue('')
    setAdding(false)
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-2 rounded-full border border-neutral-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${item}`}
              className="text-gray-500 transition hover:text-red-500"
            >
              <Icon name="x" className="h-3 w-3" />
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
                setValue('')
                setAdding(false)
              }
            }}
            onBlur={commit}
            placeholder="Type and press Enter"
            aria-label={`New ${label.toLowerCase()}`}
            className="w-40 rounded-full border border-brand bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-brand/20"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 rounded-full border border-brand/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-amber-500/20"
          >
            <Icon name="plus" className="h-3 w-3" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  )
}
