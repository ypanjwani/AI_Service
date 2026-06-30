import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

const baseInput =
  'w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-1'
const okCls  = 'border-white/10 focus:border-violet-500 focus:ring-violet-500/20'
const errCls = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'

const FEATURES = [
  {
    color: 'violet',
    title: 'AI-Driven Personalisation',
    desc: "Your website adapts in real time — headlines, CTAs, and layout shift based on each visitor's behaviour, location, and intent. Every user sees the version of your site most likely to convert them.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    color: 'purple',
    title: 'Automated SEO & Content',
    desc: 'AI generates and continuously refreshes your on-page content, meta tags, alt text, and structured data — keeping you ranking without manual effort as search algorithms evolve.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    color: 'blue',
    title: 'Smart Lead Capture',
    desc: 'An embedded AI widget greets visitors, qualifies their intent, and routes hot leads directly to your sales workflow — 24 hours a day, without a human in the loop.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    color: 'indigo',
    title: 'Conversion Rate Optimisation',
    desc: 'AI models analyse your funnel heatmaps, scroll depth, and drop-off points — then surface specific layout, copy, and form tweaks that directly lift conversions without guesswork.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

const colorMap = {
  violet: { icon: 'text-violet-400', bg: 'bg-violet-500/8 border-violet-500/15' },
  purple: { icon: 'text-purple-400', bg: 'bg-purple-500/8 border-purple-500/15' },
  blue:   { icon: 'text-blue-400',   bg: 'bg-blue-500/8 border-blue-500/15' },
  indigo: { icon: 'text-indigo-400', bg: 'bg-indigo-500/8 border-indigo-500/15' },
}

const INDUSTRIES = [
  'E-Commerce', 'SaaS & Tech', 'Real Estate', 'Healthcare',
  'Legal Services', 'Finance & Banking', 'Education', 'Hospitality',
  'Retail', 'Consulting', 'Events & Media', 'Manufacturing',
]

const INCLUDED = [
  'Custom website design & development',
  'AI personalisation & behaviour layer',
  'Automated SEO setup & monitoring',
  'Conversion-focused landing pages',
  'AI lead capture chat widget',
  'CMS integration (WordPress / custom)',
  'Mobile-first responsive design',
  '30-day post-launch support',
]

const todayStr = new Date().toISOString().split('T')[0]

export default function AIWebsitesServicePage() {
  const { user, updateUser } = useAuth()
  const navigate             = useNavigate()

  const [message,   setMessage]   = useState('')
  const [date,      setDate]      = useState('')
  const [time,      setTime]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [errors,    setErrors]    = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [apiError,  setApiError]  = useState('')

  async function handleConfirm(ev) {
    ev.preventDefault()
    const e = {}
    if (!message.trim() || message.trim().length < 10) e.message = 'Please tell us what you want to discuss'
    if (!date) e.date = 'Please pick a preferred date'
    if (!time) e.time = 'Please pick a preferred time'
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
        const saved = await apiFetch(`${API}/api/auth/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone: phone.replace(/\D/g, '') }),
        })
        if (saved.ok) { const d = await saved.json(); if (d?.data) updateUser(d.data) }
      }

      const res = await apiFetch(`${API}/api/services/inquiry`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service: 'ai_website',
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

      <div className="fixed inset-0 pointer-events-none select-none z-0" style={{ opacity: 0.025 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="aiw-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#aiw-grain)" />
        </svg>
      </div>

      <div className="fixed top-0 right-1/3 w-[600px] h-[500px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/3 left-0 w-[350px] h-[400px] bg-purple-700/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-28">

        <Link
          to="/"
          state={{ scrollTo: 'services' }}
          className="inline-flex items-center gap-2 text-[0.8rem] font-semibold text-slate-500 hover:text-violet-400 transition-colors duration-200 mb-12"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">

          {/* ══ LEFT ══ */}
          <div className="lg:col-span-7 space-y-14">

            <div>
              <span className="inline-flex items-center gap-2 mb-5">
                <span className="h-px w-6 bg-violet-500" />
                <span className="text-[0.7rem] font-black text-violet-400 uppercase tracking-[0.22em]">
                  AI Websites
                </span>
              </span>

              <h1 className="text-[2.4rem] lg:text-[3rem] font-black text-white leading-[1.1] tracking-tight mb-6">
                Websites That{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400">
                  Think & Convert
                </span>
              </h1>

              <p className="text-[1.05rem] text-slate-400 leading-[1.85] mb-5">
                We build websites that go beyond static design. Each site includes an AI layer that
                personalises content in real time, captures leads intelligently, and continuously
                optimises itself for search engines — all without your team lifting a finger after launch.
              </p>

              <p className="text-[0.95rem] text-slate-500 leading-[1.85]">
                From a solo consultant's landing page to an enterprise SaaS product site, we tailor
                every element to your audience and business goals. The result is a site that doesn't
                just look good — it actively works to grow your business around the clock.
              </p>
            </div>

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

            <div>
              <h2 className="text-[1.2rem] font-black text-white mb-2">Industries we serve</h2>
              <p className="text-[0.85rem] text-slate-500 mb-5 leading-relaxed">
                Any business that needs a high-converting online presence is a strong fit.
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

            <div>
              <h2 className="text-[1.2rem] font-black text-white mb-2">Our technology stack</h2>
              <p className="text-[0.85rem] text-slate-500 mb-5">
                We select the best tools for your project — no vendor lock-in.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  { label: 'React / Next.js', sub: 'Frontend' },
                  { label: 'AI Personalisation', sub: 'Behaviour layer' },
                  { label: 'Headless CMS', sub: 'Content management' },
                ].map(l => (
                  <div
                    key={l.label}
                    className="px-5 py-3 bg-violet-500/8 border border-violet-500/18 rounded-xl text-center min-w-[130px]"
                  >
                    <p className="text-[0.85rem] font-black text-violet-300">{l.label}</p>
                    <p className="text-[0.65rem] text-violet-500/60 mt-0.5">{l.sub}</p>
                  </div>
                ))}
              </div>
              <p className="text-[0.74rem] text-slate-600 leading-relaxed">
                Frameworks: React · Next.js · Tailwind · WordPress · Webflow — we match the stack to your team's ability to maintain it long-term.
              </p>
            </div>

          </div>

          {/* ══ RIGHT ══ */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-4">

              <div className="bg-slate-900 border border-white/8 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

                <div className="px-7 py-6 border-b border-white/8">
                  <p className="text-[0.68rem] font-black text-slate-500 uppercase tracking-widest mb-4">
                    What's included
                  </p>
                  <ul className="space-y-2.5">
                    {INCLUDED.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-[0.82rem] text-slate-300">
                        <svg className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-7 py-6">
                  {!user ? (
                    <div className="text-center py-4">
                      <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-white font-black text-[1rem] mb-1.5">Sign in to book your call</h3>
                      <p className="text-slate-500 text-[0.8rem] leading-relaxed mb-5">
                        We already have your details from your account — just sign in and you're one step away.
                      </p>
                      <button
                        onClick={() => navigate('/login', { state: { next: '/service/ai-websites' } })}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black text-[0.88rem] py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/25 mb-3"
                      >
                        Sign In
                      </button>
                      <a href="/register" className="text-[0.78rem] text-slate-500 hover:text-violet-400 transition-colors">
                        New here? Create a free account →
                      </a>
                    </div>

                  ) : submitted ? (
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
                    <form onSubmit={handleConfirm} noValidate className="space-y-5">

                      <p className="text-[0.68rem] font-black text-slate-500 uppercase tracking-widest">
                        Book a free discovery call
                      </p>

                      <div className="flex items-center gap-3 p-3.5 bg-slate-800/50 border border-white/6 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-[0.85rem] font-black shrink-0 shadow-lg shadow-violet-600/30">
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

                      <div>
                        <label className="block text-[0.72rem] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                          What do you want to discuss? *
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g. E-commerce site for my clothing brand, need AI product recommendations and lead capture…"
                          value={message}
                          onChange={e => { setMessage(e.target.value); setErrors(p => ({ ...p, message: undefined })) }}
                          className={`${baseInput} resize-none ${errors.message ? errCls : okCls}`}
                        />
                        {errors.message && <p className="mt-1 text-[0.72rem] text-red-400">{errors.message}</p>}
                      </div>

                      <div>
                        <label className="block text-[0.72rem] font-black text-slate-400 uppercase tracking-wider mb-2">
                          Preferred date & time *
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <input
                                type="date" min={todayStr} value={date}
                                onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: undefined })) }}
                                style={{ colorScheme: 'dark' }}
                                className={`${baseInput} pl-9 ${errors.date ? errCls : okCls}`}
                              />
                            </div>
                            {errors.date && <p className="mt-1 text-[0.72rem] text-red-400">{errors.date}</p>}
                          </div>
                          <div>
                            <div className="relative">
                              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <input
                                type="time" value={time}
                                onChange={e => { setTime(e.target.value); setErrors(p => ({ ...p, time: undefined })) }}
                                style={{ colorScheme: 'dark' }}
                                className={`${baseInput} pl-9 ${errors.time ? errCls : okCls}`}
                              />
                            </div>
                            {errors.time && <p className="mt-1 text-[0.72rem] text-red-400">{errors.time}</p>}
                          </div>
                        </div>
                      </div>

                      {apiError && (
                        <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                          <p className="text-[0.75rem] text-red-400">{apiError}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[0.9rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 flex items-center justify-center gap-2"
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
