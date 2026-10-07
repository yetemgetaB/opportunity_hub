import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import type { UserRole } from '../types/auth'

export default function RoleRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user, isAuthenticated } = useAuthContext()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) {
    const home = user.role === 'ORGANIZATION' ? '/organization' : user.role === 'ADMIN' ? '/admin' : '/student'
    return <Navigate to={home} replace />
  }
  return <Outlet />
}
