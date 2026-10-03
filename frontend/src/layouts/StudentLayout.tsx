import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import StudentSidebar from '../components/layout/StudentSidebar'
import StudentTopbar from '../components/layout/StudentTopbar'
import { SavedProvider } from '../context/SavedContext'

export default function StudentLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <SavedProvider>
      <div className="min-h-screen bg-slate-50 lg:flex">
        <StudentSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <StudentTopbar onMenu={() => setMenuOpen(true)} />
          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SavedProvider>
  )
}