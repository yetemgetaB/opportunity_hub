import { useState } from 'react'
import Icon from '../ui/Icon'
import Toggle from '../ui/Toggle'
import { DEFAULT_STUDENT_NOTIFICATION_PREFS } from '../../utils/studentData'

export default function StudentNotificationPreferencesCard() {
  const [prefs, setPrefs] = useState(DEFAULT_STUDENT_NOTIFICATION_PREFS)

  function toggle(id: string) {
    // TODO: persist this change via a real API call
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)))
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-brand">
          <Icon name="bell" className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-sm font-bold text-navy">Notification Preferences</h2>
      </div>

      <ul className="mt-2 divide-y divide-slate-100">
        {prefs.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 py-3.5">
            <div>
              <p className="text-sm font-medium text-navy">{p.label}</p>
              <p className="text-xs text-slate-400">{p.description}</p>
            </div>
            <Toggle checked={p.enabled} onChange={() => toggle(p.id)} label={p.label} />
          </li>
        ))}
      </ul>
    </section>
  )
}