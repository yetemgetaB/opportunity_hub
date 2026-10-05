import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthContextValue, MockUser, RegisterInput } from '../types/auth'
import { getCurrentMockUser, loginAccount, logoutAccount, registerAccount } from '../services/authService'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(getCurrentMockUser)

  const register = useCallback(async (input: RegisterInput) => registerAccount(input), [])
  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginAccount(email, password)
    setUser(loggedInUser)
    return loggedInUser
  }, [])
  const logout = useCallback(() => {
    logoutAccount()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading: false, register, login, logout }),
    [user, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used within AuthProvider')
  return context
}
