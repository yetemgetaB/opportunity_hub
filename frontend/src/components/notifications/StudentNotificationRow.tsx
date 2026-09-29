import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import type { StudentNotificationItem } from '../../types/studentNotification'

export default function StudentNotificationRow({ n, onRead }: { n: StudentNotificationItem; onRead: (id: string) => void }) {
  const navigate = useNavigate()

  function handleClick() {
    onRead(n.id)
    if (n.link) navigate(n.link)
  }

  return (
    <li className={`border-t border-slate-100 first:border-t-0 ${n.read ? '' : 'bg-amber-50/40'}`}>
      <button type="button" onClick={handleClick} className="flex w-full gap-3 px-5 py-4 text-left transition hover:bg-slate-50">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${n.iconStyle}`}>
          <Icon name={n.icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className={`text-sm ${n.read ? 'font-normal text-navy' : 'font-semibold text-navy'}`}>{n.title}</p>
            <span className="shrink-0 text-xs text-slate-400">{n.time}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{n.description}</p>
        </div>
        {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />}
      </button>
    </li>
  )
}