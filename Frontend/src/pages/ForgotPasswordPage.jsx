import { useState } from 'react'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

const baseInput =
  'w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-1'
const okCls  = 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
const errCls = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('')
  const [emailErr,  setEmailErr]  = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [apiError,  setApiError]  = useState('')

  async function handleSubmit(ev) {
    ev.preventDefault()

    const trimmed = email.trim().toLowerCase()
    if (!trimmed) { setEmailErr('Email is required'); return }
    if (!trimmed.includes('@')) { setEmailErr('Enter a valid email address'); return }

    setLoading(true)
    setApiError('')

    try {
      const res  = await apiFetch(`${API}/api/auth/password-reset/request`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()

      if (res.ok || res.status === 422) {
        setSubmitted(true)
        return
      }

      if (res.status === 429) {
        setApiError('Too many requests. Please wait before trying again.')
        return
      }

      setApiError(data.message ?? 'Something went wrong. Please try again.')
    } catch {
      setApiError('Network error — could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-28">

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none select-none" style={{ opacity: 0.03 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="fp-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#fp-grain)" />
        </svg>
      </div>

      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-white/8 rounded-3xl p-8 shadow-2xl shadow-black/60">

        {!submitted ? (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-[1.6rem] font-black text-white mb-1">Forgot password?</h1>
              <p className="text-[0.875rem] text-slate-400">
                Enter your registered email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailErr(''); setApiError('') }}
                  className={`${baseInput} ${emailErr ? errCls : okCls}`}
                  autoComplete="email"
                />
                {emailErr && <p className="mt-1 text-[0.73rem] text-red-400">{emailErr}</p>}
              </div>

              {apiError && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-[0.78rem] text-red-400">{apiError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[0.95rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </>
                ) : 'Send Reset Link →'}
              </button>
            </form>

            <p className="text-center text-[0.78rem] text-slate-500 mt-6">
              Remembered it?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Back to Sign In
              </a>
            </p>
          </>
        ) : (
          /* ── Success state ── */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-[1.3rem] font-black text-white mb-2">Check your inbox</h2>
            <p className="text-[0.85rem] text-slate-400 leading-relaxed mb-6">
              If <span className="text-white font-semibold">{email}</span> is registered,
              you'll receive a password reset link shortly.
            </p>
            <p className="text-[0.75rem] text-slate-600 mb-6">
              The link expires in 60 minutes. Check your spam folder if you don't see it.
            </p>
            <a
              href="/login"
              className="inline-block text-[0.85rem] text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              ← Back to Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
