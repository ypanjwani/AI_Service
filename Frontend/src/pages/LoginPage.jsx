import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

const baseInput =
  'w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-1'
const okCls  = 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
const errCls = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'

function EyeIcon({ visible }) {
  return visible ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [form, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const setField = (field, val) => {
    setFormData(p => ({ ...p, [field]: val }))
    setErrors(p => ({ ...p, [field]: undefined }))
    setApiError('')
  }

  /* ── Client-side validation (basic format check only) ── */
  function validate() {
    const e = {}
    if (!form.email) {
      e.email = 'Email is required'
    } else if (!form.email.includes('@')) {
      e.email = 'Enter a valid email address'
    }
    if (!form.password) {
      e.password = 'Password is required'
    }
    return e
  }

  /* ── Submit → POST /api/auth/login ── */
  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')

    try {
      const res = await apiFetch(`${API}/api/auth/login`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',    // required: browser stores the httpOnly cookie
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      const data = await res.json()

      if (res.ok) {
        login(data.data)
        navigate(location.state?.next ?? '/')
        return
      }

      if (res.status === 401) {
        setApiError(data.message ?? 'Invalid email or password')
        return
      }

      if (res.status === 422 && data.errors) {
        const fieldErrors = {}
        data.errors.forEach(e => { fieldErrors[e.field] = e.message })
        setErrors(fieldErrors)
        return
      }

      setApiError(data.message ?? 'Something went wrong. Please try again.')
    } catch {
      setApiError('Network error — could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-28">

      {/* Grain texture */}
      <div className="fixed inset-0 pointer-events-none select-none" style={{ opacity: 0.03 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="login-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#login-grain)" />
        </svg>
      </div>

      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* ── Card ── */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/8 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 flex">

        {/* ── Left brand panel ── */}
        <div className="hidden lg:flex flex-col justify-between w-[40%] shrink-0 bg-gradient-to-b from-blue-950/60 to-slate-900 border-r border-white/6 p-10">
          <div>
            <div className="text-[1.05rem] font-black tracking-tight mb-10">
              <span className="text-blue-400">AI</span>
              <span className="text-white"> Automation Labs</span>
            </div>

            <h2 className="text-[1.75rem] font-black text-white leading-snug mb-3">
              Welcome<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                back
              </span>
            </h2>
            <p className="text-[0.875rem] text-slate-400 leading-relaxed mb-8">
              Sign in to access your AI dashboard and continue building the future.
            </p>

            <ul className="space-y-4">
              {[
                'Access your AI solutions',
                'Track project progress',
                'Chat with your support team',
                'Scale your automations',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-[0.85rem] text-slate-300">
                  <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[0.72rem] text-slate-600">© 2025 AI Automation Labs. All rights reserved.</p>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">

          <div className="mb-8">
            <h1 className="text-[1.6rem] font-black text-white mb-1">Sign In</h1>
            <p className="text-[0.875rem] text-slate-400">
              Don't have an account?{' '}
              <a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Create one
              </a>
            </p>
          </div>

          {/* Google */}
          <GoogleAuthButton label="Continue with Google" />

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-white/8" />
            <span className="text-[0.72rem] font-semibold text-slate-500 uppercase tracking-wider">or</span>
            <span className="flex-1 h-px bg-white/8" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                placeholder="you@gmail.com"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                className={`${baseInput} ${errors.email ? errCls : okCls}`}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-[0.73rem] text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider">
                  Password <span className="text-red-400">*</span>
                </label>
                <a href="/forgot-password" className="text-[0.73rem] text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  className={`${baseInput} ${errors.password ? errCls : okCls} pr-10`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <EyeIcon visible={showPw} />
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[0.73rem] text-red-400">{errors.password}</p>}
            </div>

            {/* API error banner */}
            {apiError && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[0.78rem] text-red-400">{apiError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[0.95rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In →'}
            </button>

          </form>

        </div>
      </div>
    </div>
  )
}
