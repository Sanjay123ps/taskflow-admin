import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchCurrentAdmin, login as loginRequest, logout as logoutRequest, type LoginInput } from '@/api/auth'
import { refreshAccessToken, setAccessToken } from '@/api/client'
import type { AdminProfile } from '@/types/user'

interface AuthContextValue {
  admin: AdminProfile | null
  status: 'checking' | 'authenticated' | 'unauthenticated'
  error: string | null
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  updateAdminProfile: (patch: Partial<AdminProfile>) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [status, setStatus] = useState<AuthContextValue['status']>('checking')
  const [error, setError] = useState<string | null>(null)

  const bootstrap = useCallback(async () => {
    // The access token lives in memory only, so it never survives a page
    // reload. The only thing that can survive is the httpOnly refresh
    // cookie, so on first load we try to exchange it for a fresh access
    // token before deciding whether the person is signed in.
    const token = await refreshAccessToken()
    if (!token) {
      setStatus('unauthenticated')
      return
    }
    try {
      const profile = await fetchCurrentAdmin()
      setAdmin(profile)
      setStatus('authenticated')
    } catch {
      setAccessToken(null)
      setStatus('unauthenticated')
    }
  }, [])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const handleExpired = () => {
      setAdmin(null)
      setStatus('unauthenticated')
    }
    window.addEventListener('taskflow:session-expired', handleExpired)
    return () => window.removeEventListener('taskflow:session-expired', handleExpired)
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    setError(null)
    try {
      const profile = await loginRequest(input)
      setAdmin(profile)
      setStatus('authenticated')
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message ?? 'Unable to sign in. Please try again.')
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setAdmin(null)
    setStatus('unauthenticated')
  }, [])

  const updateAdminProfile = useCallback((patch: Partial<AdminProfile>) => {
    setAdmin((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const value = useMemo(
    () => ({ admin, status, error, login, logout, updateAdminProfile }),
    [admin, status, error, login, logout, updateAdminProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
