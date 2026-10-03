import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import OrgSidebar from '../components/layout/OrgSidebar'
import OrgTopbar from '../components/layout/OrgTopbar'

export default function OrganizationLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <OrgSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <OrgTopbar onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}