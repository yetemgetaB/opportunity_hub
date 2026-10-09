import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/organizations', label: 'Organizations' },
  { to: '/admin/reports', label: 'Reports' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Admin</p>
            <h1 className="font-display text-xl font-bold text-navy">Platform Console</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) => `rounded-full px-3 py-1.5 transition ${isActive ? 'bg-brand text-white' : 'hover:bg-slate-100'}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
