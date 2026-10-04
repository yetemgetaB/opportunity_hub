import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import StudentSidebar from '../components/layout/StudentSidebar'
import StudentTopbar from '../components/layout/StudentTopbar'
import { SavedProvider } from '../context/SavedContext'

export default function StudentLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isDashboard = pathname === '/student'

  return (
    <SavedProvider>
      <div className="student-layout min-h-screen bg-white lg:flex">
        <StudentSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="student-workspace flex min-w-0 flex-1 flex-col bg-white">
          <StudentTopbar onMenu={() => setMenuOpen(true)} />
          <main className={`student-canvas flex-1 p-5 sm:p-6 lg:p-8 ${isDashboard ? 'bg-white' : 'bg-slate-50'}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </SavedProvider>
  )
}