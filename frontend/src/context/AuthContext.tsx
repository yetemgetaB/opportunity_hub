/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthContextValue, AuthResponse, AuthUser, RegisterInput } from '../types/auth'
import { clearSession, getCurrentUser, loginAccount, logoutAccount, registerAccount } from '../services/authService'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser) })
      .catch(() => {
        clearSession()
        if (active) setUser(null)
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  const register = useCallback((input: RegisterInput): Promise<AuthResponse> => registerAccount(input), [])
  const login = useCallback(async (email: string, password: string) => {
    const authenticatedUser = await loginAccount(email, password)
    setUser(authenticatedUser)
    return authenticatedUser
  }, [])
  const logout = useCallback(() => {
    logoutAccount()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading, register, login, logout }),
    [user, isLoading, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider')
  return context
}
