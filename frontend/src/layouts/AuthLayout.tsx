import { Outlet } from 'react-router-dom'
import AuthBrandPanel from '../components/layout/AuthBrandPanel'

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <AuthBrandPanel />
      <main className="flex items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-md">
          <p className="mb-8 text-lg font-bold text-navy md:hidden">
            Opportunity <span className="text-brand">Hub</span>
          </p>
          <Outlet />
        </div>
      </main>
    </div>
  )
}