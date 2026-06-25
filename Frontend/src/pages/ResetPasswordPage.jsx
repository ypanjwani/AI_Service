import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

const SEQ_PATTERNS = [
  '0123','1234','2345','3456','4567','5678','6789','7890',
  '9876','8765','7654','6543','5432','4321','3210',
]

function validatePassword(value) {
  const errors = []
  if (!value)                                               return ['Password is required']
  if (value.length < 8 || value.length > 16)               errors.push('Must be 8–16 characters')
  if (!/[a-z]/.test(value))                                errors.push('Must include a lowercase letter')
  if (!/[A-Z]/.test(value))                                errors.push('Must include an uppercase letter')
  if (!/[0-9]/.test(value))                                errors.push('Must include a digit')
  if (!/[^a-zA-Z0-9]/.test(value))                         errors.push('Must include a special character')
  if (!/^\d/.test(value))                                  errors.push('Must start with a digit')
  if (SEQ_PATTERNS.some(s => value.includes(s)))           errors.push('Must not contain sequential numbers')
  return errors
}

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

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [done,        setDone]        = useState(false)
  const [apiError,    setApiError]    = useState('')

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-slate-400 mb-4">This reset link is invalid or missing.</p>
          <a href="/forgot-password" className="text-blue-400 hover:text-blue-300 font-semibold">
            Request a new one →
          </a>
        </div>
      </div>
    )
  }

  function validate() {
    const e = {}
    const pwErrors = validatePassword(password)
    if (pwErrors.length) e.password = pwErrors[0]
    if (!confirm)        e.confirm  = 'Please confirm your password'
    else if (password !== confirm) e.confirm = 'Passwords do not match'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')

    try {
      const res  = await apiFetch(`${API}/api/auth/password-reset/confirm`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password, confirmPassword: confirm }),
      })
      const data = await res.json()

      if (res.ok) { setDone(true); return }

      if (res.status === 422 && data.errors) {
        const fieldErrors = {}
        data.errors.forEach(e => { fieldErrors[e.field] = e.message })
        setErrors(fieldErrors)
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
          <filter id="rp-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#rp-grain)" />
        </svg>
      </div>

      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-white/8 rounded-3xl p-8 shadow-2xl shadow-black/60">

        {done ? (
          /* ── Success ── */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[1.3rem] font-black text-white mb-2">Password updated!</h2>
            <p className="text-[0.85rem] text-slate-400 leading-relaxed mb-6">
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
            <a
              href="/login"
              className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-[0.9rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 text-center"
            >
              Sign In →
            </a>
          </div>

        ) : (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-[1.6rem] font-black text-white mb-1">Set new password</h1>
              <p className="text-[0.875rem] text-slate-400">
                Must be 8–16 characters, start with a digit, and include uppercase, lowercase, number and special character.
              </p>
            </div>

            {/* Invalid / expired token error shown as banner */}
            {apiError && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                <p className="text-[0.78rem] text-red-400">{apiError}</p>
                {(apiError.toLowerCase().includes('expired') || apiError.toLowerCase().includes('invalid')) && (
                  <a href="/forgot-password" className="block mt-2 text-[0.75rem] text-blue-400 hover:text-blue-300 font-semibold">
                    Request a new reset link →
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* New password */}
              <div>
                <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="8–16 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                    className={`${baseInput} ${errors.password ? errCls : okCls} pr-10`}
                    autoComplete="new-password"
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

              {/* Confirm password */}
              <div>
                <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })) }}
                    className={`${baseInput} ${errors.confirm ? errCls : okCls} pr-10`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <EyeIcon visible={showConfirm} />
                  </button>
                </div>
                {errors.confirm && <p className="mt-1 text-[0.73rem] text-red-400">{errors.confirm}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[0.95rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-1"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating…
                  </>
                ) : 'Update Password →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
