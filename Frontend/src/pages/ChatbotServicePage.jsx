import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

async function savePhone(phone) {
  const res = await apiFetch(`${API}/api/auth/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ phone }),
  })
  return res.ok ? res.json() : null
}

const baseInput =
  'w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-1'
const okCls  = 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
const errCls = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'

const FEATURES = [
  {
    color: 'blue',
    title: 'Domain-Specific Training',
    desc: 'Your chatbot is built and trained around your exact industry — medical, legal, education, e-commerce, real estate, and more. It understands your terminology and only answers within your defined scope.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    color: 'purple',
    title: 'Multilingual Support',
    desc: 'Every chatbot ships with Hindi, English, and one regional language of your choice — Marathi, Gujarati, Tamil, Telugu, Bengali, Kannada, and more. Included at no extra cost.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    color: 'green',
    title: 'Optimised API Costs',
    desc: 'We structure your chatbot\'s AI calls to use the least tokens possible through prompt optimisation and intelligent caching — keeping your monthly AI API bills significantly lower.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    color: 'cyan',
    title: 'Website & WhatsApp Integration',
    desc: 'We embed the chatbot directly on your website as a chat widget and connect it to WhatsApp Business — so your customers can reach you on the platform they already use, 24/7.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
]

const colorMap = {
  blue:   { icon: 'text-blue-400',   bg: 'bg-blue-500/8 border-blue-500/15' },
  purple: { icon: 'text-purple-400', bg: 'bg-purple-500/8 border-purple-500/15' },
  green:  { icon: 'text-green-400',  bg: 'bg-green-500/8 border-green-500/15' },
  cyan:   { icon: 'text-cyan-400',   bg: 'bg-cyan-500/8 border-cyan-500/15' },
}

const INDUSTRIES = [
  'Healthcare', 'Legal Services', 'Education', 'E-Commerce',
  'Real Estate', 'Finance & Banking', 'HR & Recruitment', 'Hospitality',
  'Government Services', 'Insurance', 'Travel & Tourism', 'Retail',
]

const INCLUDED = [
  'Custom knowledge base for your domain',
  'AI language model API integration',
  'Hindi + English + 1 regional language',
  'Website chat widget setup',
  'WhatsApp Business integration',
  'API cost optimisation',
  '30-day post-launch support',
  'Free discovery & scoping call',
]


const todayStr = new Date().toISOString().split('T')[0]

/* ════════════════════════════════════════════════════════════ */
export default function ChatbotServicePage() {
  const { user, updateUser } = useAuth()
  const navigate             = useNavigate()

  const [message,   setMessage]   = useState('')
  const [date,      setDate]      = useState('')
  const [time,      setTime]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [errors,    setErrors]    = useState({})
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [apiError,  setApiError]  = useState('')

  async function handleConfirm(ev) {
    ev.preventDefault()
    const e = {}
    if (!message.trim() || message.trim().length < 10) e.message = 'Please tell us what you want to discuss'
    if (!date)  e.date = 'Please pick a preferred date'
    if (!time)  e.time = 'Please pick a preferred time'
    if (!user.phone) {
      if (!phone.trim()) e.phone = 'Phone number is required'
      else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) e.phone = 'Must be exactly 10 digits'
    }
    if (Object.keys(e).length) { setErrors(e); return }

    setLoading(true)
    setApiError('')

    const resolvedPhone = user.phone || phone.replace(/\D/g, '')

    try {
      if (!user.phone && phone) {
        const saved = await savePhone(resolvedPhone)
        if (saved?.data) updateUser(saved.data)
      }

      const res = await apiFetch(`${API}/api/services/inquiry`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service: 'chatbot',
          name:    user.name,
          email:   user.email,
          phone:   resolvedPhone,
          message: `[Preferred date & time: ${date} at ${time}]\n\n${message.trim()}`,
        }),
      })
      const data = await res.json()
      if (res.ok) { setSubmitted(true); return }
      setApiError(data.message ?? 'Something went wrong. Please try again.')
    } catch {
      setApiError('Network error — is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Grain texture */}
      <div className="fixed inset-0 pointer-events-none select-none z-0" style={{ opacity: 0.025 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="cb-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#cb-grain)" />
        </svg>
      </div>

      {/* Ambient glows */}
      <div className="fixed top-0 right-1/3 w-[600px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/3 left-0 w-[350px] h-[400px] bg-indigo-700/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-28">

        {/* Breadcrumb */}
        <a
          href="/#services"
          className="inline-flex items-center gap-2 text-[0.8rem] font-semibold text-slate-500 hover:text-blue-400 transition-colors duration-200 mb-12"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </a>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">

          {/* ══════════ LEFT COLUMN ══════════ */}
          <div className="lg:col-span-7 space-y-14">

            {/* Title block */}
            <div>
              <span className="inline-flex items-center gap-2 mb-5">
                <span className="h-px w-6 bg-blue-500" />
                <span className="text-[0.7rem] font-black text-blue-400 uppercase tracking-[0.22em]">
                  Chatbot Development
                </span>
              </span>

              <h1 className="text-[2.4rem] lg:text-[3rem] font-black text-white leading-[1.1] tracking-tight mb-6">
                Domain-Specific{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400">
                  AI Chatbots
                </span>
              </h1>

              <p className="text-[1.05rem] text-slate-400 leading-[1.85] mb-5">
                We design and deploy AI chatbots trained specifically on your domain. Whether it's a
                medical assistant answering patient queries, a legal bot explaining basic procedures, or
                an e-commerce helper guiding purchases — the chatbot speaks your industry's language
                and handles queries around the clock without human intervention.
              </p>

              <p className="text-[0.95rem] text-slate-500 leading-[1.85]">
                The chatbot connects to leading AI language model APIs. We optimise every aspect of
                how it uses those APIs so your monthly running cost stays low — even as query volumes
                grow. You get enterprise-grade AI without unpredictable bills.
              </p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-[1.2rem] font-black text-white mb-6">What you get</h2>
              <div className="space-y-3">
                {FEATURES.map((f, i) => {
                  const c = colorMap[f.color]
                  return (
                    <div
                      key={i}
                      className="flex gap-4 p-5 rounded-2xl bg-slate-900/60 border border-white/6 hover:border-white/10 transition-colors duration-200"
                    >
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${c.bg} ${c.icon}`}>
                        {f.icon}
                      </div>
                      <div>
                        <p className="font-black text-white text-[0.95rem] mb-1">{f.title}</p>
                        <p className="text-[0.84rem] text-slate-400 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Industries */}
            <div>
              <h2 className="text-[1.2rem] font-black text-white mb-2">Industries we serve</h2>
              <p className="text-[0.85rem] text-slate-500 mb-5 leading-relaxed">
                Any business that handles repetitive customer queries is a strong fit for a domain chatbot.
              </p>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => (
                  <span
                    key={ind}
                    className="px-3.5 py-1.5 bg-slate-800/70 border border-white/7 rounded-lg text-[0.78rem] font-semibold text-slate-300"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Language support */}
            <div>
              <h2 className="text-[1.2rem] font-black text-white mb-2">Languages included</h2>
              <p className="text-[0.85rem] text-slate-500 mb-5">
                Three languages ship as standard with every chatbot — no extra charges.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  { label: 'Hindi',        sub: 'Included' },
                  { label: 'English',      sub: 'Included' },
                  { label: '+1 Regional',  sub: 'Your choice' },
                ].map(l => (
                  <div
                    key={l.label}
                    className="px-5 py-3 bg-indigo-500/8 border border-indigo-500/18 rounded-xl text-center min-w-[110px]"
                  >
                    <p className="text-[0.85rem] font-black text-indigo-300">{l.label}</p>
                    <p className="text-[0.65rem] text-indigo-500/60 mt-0.5">{l.sub}</p>
                  </div>
                ))}
              </div>
              <p className="text-[0.74rem] text-slate-600 leading-relaxed">
                Available regional languages: Marathi · Gujarati · Tamil · Telugu · Kannada · Bengali · Punjabi · Odia — mention your preference when you reach out.
              </p>
            </div>

          </div>

          {/* ══════════ RIGHT COLUMN ══════════ */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-4">

              {/* Purchase card */}
              <div className="bg-slate-900 border border-white/8 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

                {/* Price */}
                <div className="bg-gradient-to-br from-blue-950/70 to-slate-900 px-7 py-7 border-b border-white/8">
                  <p className="text-[0.68rem] font-black text-blue-400/80 uppercase tracking-widest mb-2">
                    Starting at
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[3.2rem] font-black text-white leading-none">₹5,000</span>
                    <span className="text-slate-400 text-sm">one-time</span>
                  </div>
                  <p className="text-[0.75rem] text-slate-500 leading-relaxed">
                    Final price is confirmed after the free scoping call based on domain depth,
                    number of languages, and integration scope.
                  </p>
                </div>

                {/* Included */}
                <div className="px-7 py-6 border-b border-white/8">
                  <p className="text-[0.68rem] font-black text-slate-500 uppercase tracking-widest mb-4">
                    What's included
                  </p>
                  <ul className="space-y-2.5">
                    {INCLUDED.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-[0.82rem] text-slate-300">
                        <svg className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Booking widget */}
                <div className="px-7 py-6">
                  {!user ? (
                    /* ── Not logged in ── */
                    <div className="text-center py-4">
                      <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-white font-black text-[1rem] mb-1.5">Sign in to book your call</h3>
                      <p className="text-slate-500 text-[0.8rem] leading-relaxed mb-5">
                        We already have your details from your account — just sign in and you're one step away.
                      </p>
                      <button
                        onClick={() => navigate('/login', { state: { next: '/service/chatbot' } })}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-[0.88rem] py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 mb-3"
                      >
                        Sign In
                      </button>
                      <a href="/register" className="text-[0.78rem] text-slate-500 hover:text-blue-400 transition-colors">
                        New here? Create a free account →
                      </a>
                    </div>

                  ) : submitted ? (
                    /* ── Success ── */
                    <div className="text-center py-4">
                      <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-white font-black text-[1.05rem] mb-2">Booking Confirmed!</h3>
                      <p className="text-slate-400 text-[0.8rem] leading-relaxed">
                        We'll reach out to{' '}
                        <span className="text-white font-semibold">{user.email}</span>{' '}
                        within 24 hours to confirm your slot.
                      </p>
                    </div>

                  ) : (
                    /* ── Logged in booking widget ── */
                    <form onSubmit={handleConfirm} noValidate className="space-y-5">

                      <p className="text-[0.68rem] font-black text-slate-500 uppercase tracking-widest">
                        Book a free discovery call
                      </p>

                      {/* User identity card — read-only */}
                      <div className="flex items-center gap-3 p-3.5 bg-slate-800/50 border border-white/6 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-[0.85rem] font-black shrink-0 shadow-lg shadow-blue-600/30">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-black text-[0.88rem] truncate">{user.name}</p>
                          <p className="text-slate-500 text-[0.75rem] truncate">{user.email}</p>
                        </div>
                        <span className="ml-auto shrink-0 text-[0.62rem] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg">
                          Verified
                        </span>
                      </div>

                      {/* Phone — only shown for Google users who skipped it */}
                      {!user.phone && (
                        <div>
                          <label className="block text-[0.72rem] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={phone}
                            onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors(p => ({ ...p, phone: undefined })) }}
                            className={`${baseInput} ${errors.phone ? errCls : okCls}`}
                          />
                          {errors.phone && <p className="mt-1 text-[0.72rem] text-red-400">{errors.phone}</p>}
                        </div>
                      )}

                      {/* What to discuss */}
                      <div>
                        <label className="block text-[0.72rem] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                          What do you want to discuss? *
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Legal chatbot for my firm, roughly 500 queries/day, need Hindi + English…"
                          value={message}
                          onChange={e => { setMessage(e.target.value); setErrors(p => ({ ...p, message: undefined })) }}
                          className={`${baseInput} resize-none ${errors.message ? errCls : okCls}`}
                        />
                        {errors.message && <p className="mt-1 text-[0.72rem] text-red-400">{errors.message}</p>}
                      </div>

                      {/* Preferred date & time */}
                      <div>
                        <label className="block text-[0.72rem] font-black text-slate-400 uppercase tracking-wider mb-2">
                          Preferred date & time *
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Date picker */}
                          <div>
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <input
                                type="date"
                                min={todayStr}
                                value={date}
                                onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: undefined })) }}
                                style={{ colorScheme: 'dark' }}
                                className={`${baseInput} pl-9 ${errors.date ? errCls : okCls}`}
                              />
                            </div>
                            {errors.date && <p className="mt-1 text-[0.72rem] text-red-400">{errors.date}</p>}
                          </div>

                          {/* Time picker */}
                          <div>
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <input
                                type="time"
                                value={time}
                                onChange={e => { setTime(e.target.value); setErrors(p => ({ ...p, time: undefined })) }}
                                style={{ colorScheme: 'dark' }}
                                className={`${baseInput} pl-9 ${errors.time ? errCls : okCls}`}
                              />
                            </div>
                            {errors.time && <p className="mt-1 text-[0.72rem] text-red-400">{errors.time}</p>}
                          </div>
                        </div>
                      </div>

                      {/* API error */}
                      {apiError && (
                        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                          <p className="text-[0.75rem] text-red-400">{apiError}</p>
                        </div>
                      )}

                      {/* Confirm */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[0.9rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Confirming…
                          </>
                        ) : 'Confirm Booking →'}
                      </button>

                      <p className="text-center text-[0.7rem] text-slate-600">
                        No commitment · Free call · We confirm within 24 hours
                      </p>
                    </form>
                  )}
                </div>

              </div>

              {/* Trust note */}
              <div className="flex items-start gap-3 px-4 py-3.5 bg-slate-900/40 border border-white/5 rounded-2xl">
                <svg className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-[0.74rem] text-slate-500 leading-relaxed">
                  Payment is only collected after you review and approve the full project scope.
                  No upfront charges before agreement.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
