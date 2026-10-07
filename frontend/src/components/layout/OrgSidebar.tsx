import { Link, NavLink } from 'react-router-dom'
import Icon from '../ui/Icon'
import { ORG_NAV } from '../../utils/organizationData'
import ThemeToggle from '../ui/ThemeToggle'

type Props = { open: boolean; onClose: () => void }

export default function OrgSidebar({ open, onClose }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy px-6 py-8 text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="flex items-center gap-2">
        <span className="font-display text-xl font-bold">
          Opportunity <span className="text-brand">Hub</span>
        </span>
        <span className="rounded-sm bg-navy-light px-1.5 py-0.5 text-[10px] font-semibold text-brand">ORG</span>
      </div>

      <nav className="mt-12 space-y-1.5" aria-label="Organization navigation">
          {ORG_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                  isActive
                    ? 'border-y-transparent border-r-transparent border-l-[3px] border-l-brand bg-brand/10 font-semibold text-white'
                    : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} className={`h-4 w-4 ${isActive ? 'text-brand' : 'text-white/40'}`} />
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
          <Link to="/organization/settings" onClick={onClose} className="flex items-center gap-3 px-1 text-sm text-white/40 hover:text-white">
            <Icon name="help" className="h-4 w-4" />
            Help Center
          </Link>
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}