import { useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import { STUDENT_INSTITUTION, STUDENT_NAME, STUDENT_NAV } from '../../utils/studentData'

export default function StudentTopbar({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const isDetail = /^\/student\/opportunities\/.+/.test(pathname)
  const current = STUDENT_NAV.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))
  const title = isDetail ? 'Opportunity Detail' : current?.title ?? 'Personal Overview'

  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-4 lg:px-8">
      <button className="rounded-md p-2 text-navy lg:hidden" aria-label="Open menu" onClick={onMenu}>
        <Icon name="menu" />
      </button>
      <h1 className="text-xl font-bold text-navy">{title}</h1>

      <div className="ml-auto flex items-center gap-5">
        <label className="relative hidden md:block">
          <span className="sr-only">Search</span>
          <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          {/* TODO: wire up to a real search */}
          <input
            type="search"
            placeholder="Search opportunities, companies..."
            className="w-72 rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-brand"
          />
        </label>
        <div className="flex items-center gap-3 md:border-l md:border-slate-200 md:pl-5">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-white">
            <Icon name="user" className="h-4 w-4" />
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-navy">{STUDENT_NAME}</p>
            <p className="text-xs text-slate-500">{STUDENT_INSTITUTION}</p>
          </div>
        </div>
      </div>
    </header>
  )
}