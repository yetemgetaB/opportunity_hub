import { Outlet } from 'react-router-dom'
import AuthBrandPanel from '../components/layout/AuthBrandPanel'

export default function AuthLayout() {
  return (
    <div className="min-h-svh bg-white md:grid md:grid-cols-2">
      <AuthBrandPanel />
      <main className="flex min-h-svh items-center justify-center bg-white px-5 py-4 sm:px-8 md:py-3 lg:px-10 xl:px-16">
        <div className="w-full max-w-96">
          <p className="mb-5 font-display text-xl font-bold text-navy md:hidden">
            Opportunity <span className="text-brand">Hub</span>
          </p>
          <Outlet />
        </div>
      </main>
    </div>
  )
}