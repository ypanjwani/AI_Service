import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

export default function GoogleAuthButton({ label = 'Continue with Google' }) {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('')
      try {
        const res = await apiFetch(`${API}/api/auth/google`, {
          method:      'POST',
          headers:     { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
        })

        const data = await res.json()

        if (res.ok) {
          login(data.data)
          navigate(location.state?.next ?? '/')
          return
        }

        setError(data.message ?? 'Google sign-in failed. Please try again.')
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setLoading(false)
      setError('Google sign-in was cancelled or failed.')
    },
  })

  return (
    <div>
      <button
        type="button"
        onClick={() => { setError(''); setLoading(true); handleGoogle() }}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20 text-white font-semibold text-[0.9rem] py-3 rounded-xl transition-all duration-200"
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
        )}
        {loading ? 'Signing in…' : label}
      </button>

      {error && (
        <p className="mt-2 text-[0.73rem] text-red-400 text-center">{error}</p>
      )}
    </div>
  )
}
