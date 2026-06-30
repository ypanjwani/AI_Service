import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null)
  const [checking, setChecking] = useState(true)  // true while /me is in-flight on mount

  /* ── On mount: check if a valid httpOnly cookie already exists ── */
  useEffect(() => {
    fetch(`${API}/api/auth/csrf/`, { credentials: 'include' }).catch(() => {})
    fetch(`${API}/api/auth/me`, { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data?.data) setUser(data.data) })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  /* Proactively refresh the JWT every 30 min so the 4-hour cookie never expires mid-session */
  useEffect(() => {
    if (!user) return
    const refresh = async () => {
      try {
        const res = await apiFetch(`${API}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        if (!res.ok) setUser(null)
      } catch {}
    }
    const id = setInterval(refresh, 30 * 60 * 1000)
    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [user])

  /* Called by LoginPage after a successful login response */
  const login = useCallback((userData) => setUser(userData), [])

  /* Merges partial updates into the current user (e.g. phone saved after Google login) */
  const updateUser = useCallback((partial) => setUser(prev => ({ ...prev, ...partial })), [])

  /* Clears the httpOnly cookie via the backend, then wipes local state */
  const logout = useCallback(async () => {
    await apiFetch(`${API}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {})
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, checking, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
