import { NavLink } from 'react-router-dom'
import Icon from '../ui/Icon'
import { STUDENT_NAV } from '../../utils/studentData'
import ThemeToggle from '../ui/ThemeToggle'

type Props = { open: boolean; onClose: () => void }

export default function StudentSidebar({ open, onClose }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-light px-6 py-6 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end">
            <ThemeToggle />
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-xl font-bold">
              Opportunity <span className="text-brand">Hub</span>
          </span>
        </div>

        <nav className="mt-10 space-y-1.5" aria-label="Student navigation">
          {STUDENT_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  isActive
                    ? 'border-brand/70 bg-white/10 font-medium text-white'
                    : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} className={`h-4 w-4 ${isActive ? 'text-brand' : ''}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-5">
          <a href="#" className="flex items-center gap-3 px-1 text-sm text-slate-300 hover:text-white">
            <Icon name="help" className="h-4 w-4" />
            Help Center
          </a>
        </div>
      </aside>
    </>
  )
}