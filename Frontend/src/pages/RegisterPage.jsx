import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/apiFetch'

/* ── Sequential digit patterns to block ── */
const SEQ = [
  '0123','1234','2345','3456','4567','5678','6789','7890',
  '9876','8765','7654','6543','5432','4321','3210',
]

const PW_RULES = [
  { label: '8–16 characters',             check: pw => pw.length >= 8 && pw.length <= 16 },
  { label: 'Starts with a digit',          check: pw => /^\d/.test(pw) },
  { label: 'Uppercase letter (A–Z)',       check: pw => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter (a–z)',       check: pw => /[a-z]/.test(pw) },
  { label: 'At least one digit',           check: pw => /[0-9]/.test(pw) },
  { label: 'Special character (!@#…)',     check: pw => /[^a-zA-Z0-9]/.test(pw) },
  { label: 'No sequential digits (1234…)', check: pw => !SEQ.some(p => pw.includes(p)) },
]

function getPasswordErrors(pw) {
  return PW_RULES.filter(r => !r.check(pw)).map(r => r.label)
}

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

const baseInput = 'w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-1'
const okCls  = 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
const errCls = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'

const API = import.meta.env.VITE_API_URL ?? ''

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('form') // 'form' | 'otp' | 'success'

  const [form, setFormData] = useState({
    name: '', email: '', dob: '', password: '', confirmPassword: '', phone: '',
  })
  const [errors,  setErrors]  = useState({})
  const [showPw,  setShowPw]  = useState(false)
  const [showCpw, setShowCpw] = useState(false)

  /* OTP state */
  const [otpToken,      setOtpToken]      = useState('')
  const [debugInfo,     setDebugInfo]     = useState(null)  // only set when DEBUG=True
  const [emailOtpBoxes, setEmailOtpBoxes] = useState(Array(6).fill(''))
  const [emailOtpError, setEmailOtpError] = useState('')
  const emailOtpRefs = useRef([])

  const [phoneOtpBoxes, setPhoneOtpBoxes] = useState(Array(6).fill(''))
  const [phoneOtpError, setPhoneOtpError] = useState('')
  const phoneOtpRefs = useRef([])

  /* API state */
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')

  /* ── field setter ── */
  const setField = (field, val) => {
    setFormData(p => ({ ...p, [field]: val }))
    setErrors(p => ({ ...p, [field]: undefined }))
  }

  /* ── form validation ── */
  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) {
      e.email = 'Email is required'
    } else if (!form.email.endsWith('@gmail.com') || form.email.length <= 10) {
      e.email = 'Email must end with @gmail.com'
    }
    if (!form.dob) e.dob = 'Date of birth is required'
    if (!form.password) {
      e.password = ['Password is required']
    } else {
      const fails = getPasswordErrors(form.password)
      if (fails.length) e.password = fails
    }
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password'
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match'
    }
    if (!form.phone) {
      e.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(form.phone)) {
      e.phone = 'Must be exactly 10 digits, no letters'
    }
    return e
  }

  /* ── Step 1: send OTPs ── */
  async function callInitiate() {
    const res = await apiFetch(`${API}/api/auth/register/initiate`, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name:            form.name,
        email:           form.email,
        dob:             form.dob,
        password:        form.password,
        confirmPassword: form.confirmPassword,
        phone:           form.phone,
      }),
    })
    return res
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')

    try {
      const res  = await callInitiate()
      const data = await res.json()

      if (res.ok) {
        setOtpToken(data.token)
        setDebugInfo(data._debug ?? null)
        setEmailOtpBoxes(Array(6).fill(''))
        setEmailOtpError('')
        setPhoneOtpBoxes(Array(6).fill(''))
        setPhoneOtpError('')
        setStep('otp')
        return
      }

      if (res.status === 409) { setErrors({ email: data.message }); return }
      if (res.status === 422 && data.errors) {
        const fe = {}
        data.errors.forEach(e => { fe[e.field] = e.message })
        setErrors(fe)
        return
      }
      setApiError(data.message ?? 'Failed to send verification code. Please try again.')
    } catch {
      setApiError('Network error — could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Resend OTPs ── */
  async function issueOtp() {
    setLoading(true)
    setApiError('')
    try {
      const res  = await callInitiate()
      const data = await res.json()
      if (res.ok) {
        setOtpToken(data.token)
        setDebugInfo(data._debug ?? null)
        setEmailOtpBoxes(Array(6).fill(''))
        setEmailOtpError('')
        setPhoneOtpBoxes(Array(6).fill(''))
        setPhoneOtpError('')
      } else {
        setApiError(data.message ?? 'Failed to resend codes.')
      }
    } catch {
      setApiError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Generic OTP box handlers ── */
  function makeOtpChange(boxes, setBoxes, refs, setErr) {
    return (i, val) => {
      if (!/^\d?$/.test(val)) return
      const next = [...boxes]; next[i] = val; setBoxes(next); setErr('')
      if (val && i < 5) setTimeout(() => refs.current[i + 1]?.focus(), 0)
    }
  }
  function makeOtpKey(boxes, refs) {
    return (i, ev) => {
      if (ev.key === 'Backspace' && !boxes[i] && i > 0) refs.current[i - 1]?.focus()
      if (ev.key === 'ArrowLeft'  && i > 0) refs.current[i - 1]?.focus()
      if (ev.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
    }
  }
  function makeOtpPaste(setBoxes, refs) {
    return (ev) => {
      const paste = ev.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      if (!paste) return
      ev.preventDefault()
      const next = Array(6).fill('')
      paste.split('').forEach((c, i) => { next[i] = c })
      setBoxes(next)
      refs.current[Math.min(paste.length, 5)]?.focus()
    }
  }

  const onEmailChange = makeOtpChange(emailOtpBoxes, setEmailOtpBoxes, emailOtpRefs, setEmailOtpError)
  const onEmailKey    = makeOtpKey(emailOtpBoxes, emailOtpRefs)
  const onEmailPaste  = makeOtpPaste(setEmailOtpBoxes, emailOtpRefs)

  const onPhoneChange = makeOtpChange(phoneOtpBoxes, setPhoneOtpBoxes, phoneOtpRefs, setPhoneOtpError)
  const onPhoneKey    = makeOtpKey(phoneOtpBoxes, phoneOtpRefs)
  const onPhonePaste  = makeOtpPaste(setPhoneOtpBoxes, phoneOtpRefs)

  /* ── Step 2: verify OTPs → create account ── */
  async function handleVerify(ev) {
    ev.preventDefault()
    setLoading(true)
    setApiError('')
    setEmailOtpError('')
    setPhoneOtpError('')

    try {
      const res = await apiFetch(`${API}/api/auth/register/verify`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token:     otpToken,
          email_otp: emailOtpBoxes.join(''),
          phone_otp: phoneOtpBoxes.join(''),
        }),
      })
      const data = await res.json()

      if (res.status === 201) { login(data.data); setStep('success'); return }

      if (res.status === 422 && data.errors) {
        // OTPMismatchError → plain dict {email_otp, phone_otp}
        // serializer failure → array [{field, message}]
        const errs = Array.isArray(data.errors)
          ? Object.fromEntries(data.errors.map(e => [e.field, e.message]))
          : data.errors
        if (errs.email_otp) setEmailOtpError(errs.email_otp)
        if (errs.phone_otp) setPhoneOtpError(errs.phone_otp)
        if (data.remaining) setApiError(`${data.remaining} attempt(s) remaining before lockout`)
        return
      }

      if (data.restart) {
        setApiError(data.message ?? 'Session expired. Go back and register again.')
        return
      }

      if (res.status === 409) { setErrors({ email: data.message }); setStep('form'); return }

      setApiError(data.message ?? 'Verification failed. Please try again.')
    } catch {
      setApiError('Network error — could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Password strength ── */
  const pwMet = form.password ? PW_RULES.filter(r => r.check(form.password)).length : 0
  const pwPct = Math.round((pwMet / PW_RULES.length) * 100)
  const strengthColor = pwPct < 30 ? '#ef4444' : pwPct < 70 ? '#f59e0b' : pwPct < 100 ? '#60a5fa' : '#22c55e'
  const strengthLabel = pwPct < 30 ? 'Weak'    : pwPct < 70 ? 'Fair'    : pwPct < 100 ? 'Good'    : 'Strong'

  /* OTP box class */
  const otpBoxCls = hasErr => `w-12 h-14 text-center text-[1.35rem] font-black text-white bg-slate-800/60 border rounded-xl outline-none transition-all duration-200 focus:ring-1 ${
    hasErr
      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
      : 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
  }`

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-28">

      {/* Grain texture */}
      <div className="fixed inset-0 pointer-events-none select-none" style={{ opacity: 0.03 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="reg-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#reg-grain)" />
        </svg>
      </div>

      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* ── Card shell ── */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-white/8 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 flex">

        {/* ─── Left brand panel ─────────────────── */}
        <div className="hidden lg:flex flex-col justify-between w-[38%] shrink-0 bg-gradient-to-b from-blue-950/60 to-slate-900 border-r border-white/6 p-10">
          <div>
            <div className="text-[1.05rem] font-black tracking-tight mb-10">
              <span className="text-blue-400">AI</span>
              <span className="text-white"> Automation Labs</span>
            </div>
            <h2 className="text-[1.75rem] font-black text-white leading-snug mb-3">
              Join the future<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                of AI
              </span>
            </h2>
            <p className="text-[0.875rem] text-slate-400 leading-relaxed mb-8">
              Create your account and unlock powerful AI tools built to transform the way you work.
            </p>
            <ul className="space-y-4">
              {[
                'Free discovery call included',
                'Tailored AI solutions for your business',
                'Dedicated expert support team',
                'Scale at your own pace',
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

        {/* ─── Right panel ─────────────────────── */}
        <div className="flex-1 p-8 lg:p-10">

          {/* ══════════ STEP: form ══════════ */}
          {step === 'form' && (
            <>
              <div className="mb-7">
                <h1 className="text-[1.6rem] font-black text-white mb-1">Create Account</h1>
                <p className="text-[0.875rem] text-slate-400">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Sign in</a>
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Full Name */}
                <div>
                  <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" placeholder="John Doe" value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    className={`${baseInput} ${errors.name ? errCls : okCls}`} />
                  {errors.name && <p className="mt-1 text-[0.73rem] text-red-400">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input type="email" placeholder="you@gmail.com" value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    className={`${baseInput} ${errors.email ? errCls : okCls}`} />
                  {errors.email && <p className="mt-1 text-[0.73rem] text-red-400">{errors.email}</p>}
                </div>

                {/* DOB + Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Date of Birth <span className="text-red-400">*</span>
                    </label>
                    <input type="date" value={form.dob} max={new Date().toISOString().split('T')[0]}
                      onChange={e => setField('dob', e.target.value)}
                      className={`${baseInput} ${errors.dob ? errCls : okCls}`} style={{ colorScheme: 'dark' }} />
                    {errors.dob && <p className="mt-1 text-[0.73rem] text-red-400">{errors.dob}</p>}
                  </div>
                  <div>
                    <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input type="tel" placeholder="10 digits" value={form.phone}
                      onChange={e => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`${baseInput} ${errors.phone ? errCls : okCls}`} />
                    {errors.phone && <p className="mt-1 text-[0.73rem] text-red-400">{errors.phone}</p>}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} placeholder="Must start with a digit…"
                      value={form.password} onChange={e => setField('password', e.target.value)}
                      className={`${baseInput} ${errors.password ? errCls : okCls} pr-10`} />
                    <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      <EyeIcon visible={showPw} />
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-[0.68rem] text-slate-500">Password strength</span>
                        <span className="text-[0.68rem] font-bold" style={{ color: strengthColor }}>{strengthLabel}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pwPct}%`, backgroundColor: strengthColor }} />
                      </div>
                    </div>
                  )}
                  {form.password && (
                    <div className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-3">
                      {PW_RULES.map(r => {
                        const ok = r.check(form.password)
                        return (
                          <div key={r.label} className="flex items-center gap-1.5">
                            <span className={`text-[0.65rem] leading-none ${ok ? 'text-green-400' : 'text-slate-600'}`}>{ok ? '✓' : '○'}</span>
                            <span className={`text-[0.68rem] leading-snug ${ok ? 'text-green-400' : 'text-slate-500'}`}>{r.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {errors.password && !form.password && (
                    <p className="mt-1 text-[0.73rem] text-red-400">{errors.password[0]}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[0.73rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input type={showCpw ? 'text' : 'password'} placeholder="Repeat your password"
                      value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)}
                      className={`${baseInput} ${errors.confirmPassword ? errCls : okCls} pr-10`} />
                    <button type="button" onClick={() => setShowCpw(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      <EyeIcon visible={showCpw} />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-[0.73rem] text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                {apiError && (
                  <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-[0.78rem] text-red-400">{apiError}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[0.95rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 mt-1 flex items-center justify-center gap-2">
                  {loading ? (<><Spinner /> Sending verification code…</>) : 'Continue — Verify Email →'}
                </button>
              </form>
            </>
          )}

          {/* ══════════ STEP: otp ══════════ */}
          {step === 'otp' && (
            <>
              <button onClick={() => setStep('form')}
                className="flex items-center gap-1.5 text-[0.8rem] text-slate-500 hover:text-slate-300 transition-colors mb-8">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to form
              </button>

              {/* Heading */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 className="text-[1.6rem] font-black text-white mb-2">Verify Your Identity</h1>
                <p className="text-[0.875rem] text-slate-400">
                  We sent 6-digit codes to your email and phone number.
                </p>
              </div>

              {/* Dev debug panel — only visible when backend DEBUG=True */}
              {debugInfo && (
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 mb-7">
                  <p className="text-[0.7rem] font-black text-amber-400 uppercase tracking-widest mb-2">Development Mode</p>
                  <p className="text-[0.7rem] text-amber-500/70 mb-0.5">Email OTP</p>
                  <p className="text-[0.9rem] text-amber-200 font-black tracking-[0.22em]">{debugInfo.email_otp}</p>
                  <p className="text-[0.7rem] text-amber-500/70 mt-3 mb-0.5">Phone OTP</p>
                  <p className="text-[0.9rem] text-amber-200 font-black tracking-[0.22em]">{debugInfo.phone_otp}</p>
                  <p className="text-[0.7rem] text-amber-500/70 mt-2">In production these codes are sent to your email and phone.</p>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-6">

                {/* ── Email OTP ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[0.8rem] text-slate-400">
                      Email code sent to <span className="text-white font-semibold">{form.email}</span>
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    {emailOtpBoxes.map((box, i) => (
                      <input key={i} ref={el => { emailOtpRefs.current[i] = el }}
                        type="text" inputMode="numeric" maxLength={1} value={box}
                        onChange={e => onEmailChange(i, e.target.value)}
                        onKeyDown={e => onEmailKey(i, e)}
                        onPaste={i === 0 ? onEmailPaste : undefined}
                        className={otpBoxCls(!!emailOtpError)} />
                    ))}
                  </div>
                  {emailOtpError && (
                    <p className="text-center text-[0.78rem] text-red-400 mt-2">{emailOtpError}</p>
                  )}
                </div>

                {/* ── Phone OTP ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-[0.8rem] text-slate-400">
                      SMS code sent to <span className="text-white font-semibold">{form.phone}</span>
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    {phoneOtpBoxes.map((box, i) => (
                      <input key={i} ref={el => { phoneOtpRefs.current[i] = el }}
                        type="text" inputMode="numeric" maxLength={1} value={box}
                        onChange={e => onPhoneChange(i, e.target.value)}
                        onKeyDown={e => onPhoneKey(i, e)}
                        onPaste={i === 0 ? onPhonePaste : undefined}
                        className={otpBoxCls(!!phoneOtpError)} />
                    ))}
                  </div>
                  {phoneOtpError && (
                    <p className="text-center text-[0.78rem] text-red-400 mt-2">{phoneOtpError}</p>
                  )}
                </div>

                {apiError && (
                  <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-[0.78rem] text-red-400">{apiError}</p>
                  </div>
                )}

                <button type="submit"
                  disabled={emailOtpBoxes.join('').length < 6 || phoneOtpBoxes.join('').length < 6 || loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[0.95rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
                  {loading ? (<><Spinner /> Verifying…</>) : 'Verify & Create Account'}
                </button>
              </form>

              <p className="text-center text-[0.8rem] text-slate-500 mt-5">
                Did not receive the codes?{' '}
                <button type="button" onClick={issueOtp} disabled={loading}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-40">
                  Resend
                </button>
              </p>
            </>
          )}

          {/* ══════════ STEP: success ══════════ */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                <svg className="w-9 h-9 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-[2rem] font-black text-white mb-2">Account Created!</h1>
              <p className="text-[0.925rem] text-slate-400 max-w-xs leading-relaxed mb-8">
                Welcome to{' '}
                <span className="text-white font-semibold">AI Automation Labs</span>,{' '}
                <span className="text-white font-semibold">{form.name}</span>!{' '}
                Your account is ready.
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold text-[0.95rem] px-10 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30">
                Go to Homepage →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
