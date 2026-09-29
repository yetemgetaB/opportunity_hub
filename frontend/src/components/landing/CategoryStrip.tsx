import { CATEGORIES } from '../../utils/constants'

export default function CategoryStrip() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-6 py-5 text-sm font-medium text-slate-600">
        {CATEGORIES.map(([icon, label]) => (
          <span key={label}>{icon} {label}</span>
        ))}
      </div>
    </div>
  )
}