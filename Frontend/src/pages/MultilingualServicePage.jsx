import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

const baseInput =
  'w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-1'
const okCls  = 'border-white/10 focus:border-rose-500 focus:ring-rose-500/20'
const errCls = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'

const FEATURES = [
  {
    color: 'rose',
    title: '50+ Language NLP Pipeline',
    desc: 'Our models understand grammar, idiom, and sentiment across more than 50 languages — including low-resource Indian regional languages that off-the-shelf tools routinely fail to handle correctly.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    color: 'pink',
    title: 'Real-Time Translation Layer',
    desc: 'Live translation integrated directly into your chat, support ticket, or content platform — users communicate in their native language while your team sees a single unified stream in your preferred language.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    color: 'red',
    title: 'Cultural Tone Adaptation',
    desc: 'Beyond literal translation, our models are fine-tuned to match the cultural register, formality level, and local idioms of each target language — making AI communication feel genuinely local, not machine-translated.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    color: 'orange',
    title: 'Dialect & Script Handling',
    desc: 'Handles language variants like Hinglish and Tanglish, non-Latin scripts (Devanagari, Tamil, Arabic, Bengali), and code-switching within a single user message — seamlessly and without special pre-processing.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
]

const colorMap = {
  rose:   { icon: 'text-rose-400',   bg: 'bg-rose-500/8 border-rose-500/15' },
  pink:   { icon: 'text-pink-400',   bg: 'bg-pink-500/8 border-pink-500/15' },
  red:    { icon: 'text-red-400',    bg: 'bg-red-500/8 border-red-500/15' },
  orange: { icon: 'text-orange-400', bg: 'bg-orange-500/8 border-orange-500/15' },
}

const INDUSTRIES = [
  'E-Commerce', 'Healthcare', 'Education', 'Government Services',
  'Banking & Finance', 'Tourism & Hospitality', 'Legal Services', 'HR & Recruitment',
  'Retail', 'Media & News', 'NGOs & Non-Profits', 'Telecom',
]

const INCLUDED = [
  '50+ language NLP model setup',
  'Real-time translation integration',
  'Cultural tone & dialect fine-tuning',
  'Hindi + English as standard',
  '3 additional regional languages',
  'Multilingual chat widget embed',
  'Non-Latin script & encoding support',
  '30-day post-launch support',
]

const todayStr = new Date().toISOString().split('T')[0]

export default function MultilingualServicePage() {
  const { user, updateUser } = useAuth()
  const navigate             = useNavigate()

  const [message,   setMessage]   = useState('')
  const [date,      setDate]      = useState('')
  const [time,      setTime]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [errors,    setErrors]    = useState({})
  const [submitted, setSubmitted] = useState(false)

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

    if (!user.phone && phone) {
      try {
        const res = await apiFetch(`${API}/api/auth/profile`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone: phone.replace(/\D/g, '') }),
        })
        if (res.ok) { const d = await res.json(); if (d?.data) updateUser(d.data) }
      } catch {}
    }

    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="fixed inset-0 pointer-events-none select-none z-0" style={{ opacity: 0.025 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="ml-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#ml-grain)" />
        </svg>
      </div>

      <div className="fixed top-0 right-1/3 w-[600px] h-[500px] bg-rose-600/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/3 left-0 w-[350px] h-[400px] bg-pink-700/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-28">

        <a
          href="/#services"
          className="inline-flex items-center gap-2 text-[0.8rem] font-semibold text-slate-500 hover:text-rose-400 transition-colors duration-200 mb-12"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">

          {/* ══ LEFT ══ */}
          <div className="lg:col-span-7 space-y-14">

            <div>
              <span className="inline-flex items-center gap-2 mb-5">
                <span className="h-px w-6 bg-rose-500" />
                <span className="text-[0.7rem] font-black text-rose-400 uppercase tracking-[0.22em]">
                  Multilingual AI Solutions
                </span>
              </span>

              <h1 className="text-[2.4rem] lg:text-[3rem] font-black text-white leading-[1.1] tracking-tight mb-6">
                AI That Speaks{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400">
                  Every Language
                </span>
              </h1>

              <p className="text-[1.05rem] text-slate-400 leading-[1.85] mb-5">
                Language barriers cost businesses customers every day. We build AI systems that
                communicate fluently in your customers' native languages — not just translated text,
                but culturally adapted responses that feel natural and trustworthy, whether that's
                Tamil, Gujarati, Arabic, or French.
              </p>

              <p className="text-[0.95rem] text-slate-500 leading-[1.85]">
                India alone has 22 official languages and hundreds of dialects. We specialise in
                these underserved languages that mainstream AI tools handle poorly — giving your
                business a genuine edge in regional and international markets.
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
                Any business with a multilingual customer base or cross-border ambitions is a strong fit.
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
              <h2 className="text-[1.2rem] font-black text-white mb-2">Languages included</h2>
              <p className="text-[0.85rem] text-slate-500 mb-5">
                Five languages ship as standard — additional languages available on request.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  { label: 'Hindi',       sub: 'Included' },
                  { label: 'English',     sub: 'Included' },
                  { label: '+3 Regional', sub: 'Your choice' },
                ].map(l => (
                  <div
                    key={l.label}
                    className="px-5 py-3 bg-rose-500/8 border border-rose-500/18 rounded-xl text-center min-w-[110px]"
                  >
                    <p className="text-[0.85rem] font-black text-rose-300">{l.label}</p>
                    <p className="text-[0.65rem] text-rose-500/60 mt-0.5">{l.sub}</p>
                  </div>
                ))}
              </div>
              <p className="text-[0.74rem] text-slate-600 leading-relaxed">
                Available: Marathi · Gujarati · Tamil · Telugu · Kannada · Bengali · Punjabi · Odia · Malayalam · Arabic · French · Spanish — mention your needs when you reach out.
              </p>
            </div>

          </div>

          {/* ══ RIGHT ══ */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-4">

              <div className="bg-slate-900 border border-white/8 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

                <div className="bg-gradient-to-br from-rose-950/50 to-slate-900 px-7 py-7 border-b border-white/8">
                  <p className="text-[0.68rem] font-black text-rose-400/80 uppercase tracking-widest mb-2">
                    Starting at
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[3.2rem] font-black text-white leading-none">$1,999</span>
                    <span className="text-slate-400 text-sm">one-time</span>
                  </div>
                  <p className="text-[0.75rem] text-slate-500 leading-relaxed">
                    Final price confirmed after the scoping call based on language count,
                    integration platform, and custom dialect requirements.
                  </p>
                </div>

                <div className="px-7 py-6 border-b border-white/8">
                  <p className="text-[0.68rem] font-black text-slate-500 uppercase tracking-widest mb-4">
                    What's included
                  </p>
                  <ul className="space-y-2.5">
                    {INCLUDED.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-[0.82rem] text-slate-300">
                        <svg className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-white font-black text-[1rem] mb-1.5">Sign in to book your call</h3>
                      <p className="text-slate-500 text-[0.8rem] leading-relaxed mb-5">
                        We already have your details from your account — just sign in and you're one step away.
                      </p>
                      <button
                        onClick={() => navigate('/login', { state: { next: '/service/multilingual' } })}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-[0.88rem] py-3 rounded-xl transition-all duration-200 shadow-lg shadow-rose-600/25 mb-3"
                      >
                        Sign In
                      </button>
                      <a href="/register" className="text-[0.78rem] text-slate-500 hover:text-rose-400 transition-colors">
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
                        <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white text-[0.85rem] font-black shrink-0 shadow-lg shadow-rose-600/30">
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
                          placeholder="e.g. Customer support chatbot for our e-commerce site, need Hindi, Tamil and Telugu…"
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
                              <input type="date" min={todayStr} value={date}
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
                              <input type="time" value={time}
                                onChange={e => { setTime(e.target.value); setErrors(p => ({ ...p, time: undefined })) }}
                                style={{ colorScheme: 'dark' }}
                                className={`${baseInput} pl-9 ${errors.time ? errCls : okCls}`}
                              />
                            </div>
                            {errors.time && <p className="mt-1 text-[0.72rem] text-red-400">{errors.time}</p>}
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-[0.9rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-rose-600/30 hover:shadow-rose-500/40"
                      >
                        Confirm Booking →
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
