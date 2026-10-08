import { Link, NavLink } from 'react-router-dom'
import Icon from '../ui/Icon'
import { STUDENT_NAV } from '../../utils/studentData'
import ThemeToggle from '../ui/ThemeToggle'
import { useNotifications } from '../../context/NotificationsContext'

type Props = { open: boolean; onClose: () => void }

export default function StudentSidebar({ open, onClose }: Props) {
  const { unreadCount, unreadCountError } = useNotifications()

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy px-6 py-6 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold">
              Opportunity <span className="text-brand">Hub</span>
          </span>
        </div>

        <nav className="mt-12 space-y-1.5" aria-label="Student navigation">
          {STUDENT_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  isActive
                    ? 'border-l-[3px] border-l-brand border-y-transparent border-r-transparent bg-brand/10 font-semibold text-white'
                    : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} className={`h-4 w-4 ${isActive ? 'text-brand' : 'text-white/40'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.to === '/student/notifications' && unreadCountError && (
                    <span
                      className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
                      title={unreadCountError}
                      aria-label="Unread notification count unavailable"
                    >
                      !
                    </span>
                  )}
                  {item.to === '/student/notifications' && !unreadCountError && unreadCount > 0 && (
                    <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white" aria-label={`${unreadCount} unread notifications`}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
          <Link to="/student/settings" className="flex items-center gap-3 px-1 text-sm text-white/40 hover:text-white">
            <Icon name="help" className="h-4 w-4" />
            Help Center
          </Link>
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}