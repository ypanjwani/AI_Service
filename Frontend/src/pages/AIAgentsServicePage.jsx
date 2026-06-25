import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

const baseInput =
  'w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-1'
const okCls  = 'border-white/10 focus:border-emerald-500 focus:ring-emerald-500/20'
const errCls = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'

const FEATURES = [
  {
    color: 'emerald',
    title: 'Multi-Step Task Execution',
    desc: 'Agents break complex goals into sub-tasks and execute them autonomously — browsing the web, reading documents, writing outputs, calling APIs, and looping until the job is fully done without human intervention.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    color: 'green',
    title: 'Real-Time Decision Making',
    desc: 'Built-in reasoning modules let agents evaluate conditions, choose between alternative paths, retry on failure, and escalate to a human only when genuinely needed — reducing false alerts and unnecessary interruptions.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    color: 'teal',
    title: 'Deep System Integration',
    desc: 'Agents connect directly to your CRM, ERP, database, or any REST/GraphQL API — reading, writing, and updating data as part of their task flow. No manual copy-paste, no middleware gaps.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    color: 'cyan',
    title: 'Self-Monitoring & Logging',
    desc: 'Every agent action is recorded with full audit trails, timestamps, and outcome data. Anomaly alerts fire when behaviour deviates from baseline — giving you complete visibility and control at all times.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
]

const colorMap = {
  emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/15' },
  green:   { icon: 'text-green-400',   bg: 'bg-green-500/8 border-green-500/15' },
  teal:    { icon: 'text-teal-400',    bg: 'bg-teal-500/8 border-teal-500/15' },
  cyan:    { icon: 'text-cyan-400',    bg: 'bg-cyan-500/8 border-cyan-500/15' },
}

const INDUSTRIES = [
  'Finance & Trading', 'E-Commerce', 'HR & Recruitment', 'Healthcare',
  'Legal Research', 'Marketing & Growth', 'IT Operations', 'Data Engineering',
  'Real Estate', 'Manufacturing', 'SaaS & Tech', 'Logistics',
]

const INCLUDED = [
  'Agent architecture & planning design',
  'LLM reasoning & tool-use layer',
  'API & system integration suite',
  'Memory & context management',
  'Error recovery & retry logic',
  'Full audit logging dashboard',
  'Load testing & optimisation',
  '30-day post-launch support',
]

const todayStr = new Date().toISOString().split('T')[0]

export default function AIAgentsServicePage() {
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
          <filter id="aia-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#aia-grain)" />
        </svg>
      </div>

      <div className="fixed top-0 right-1/3 w-[600px] h-[500px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/3 left-0 w-[350px] h-[400px] bg-teal-700/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-28">

        <a
          href="/#services"
          className="inline-flex items-center gap-2 text-[0.8rem] font-semibold text-slate-500 hover:text-emerald-400 transition-colors duration-200 mb-12"
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
                <span className="h-px w-6 bg-emerald-500" />
                <span className="text-[0.7rem] font-black text-emerald-400 uppercase tracking-[0.22em]">
                  AI Agent Development
                </span>
              </span>

              <h1 className="text-[2.4rem] lg:text-[3rem] font-black text-white leading-[1.1] tracking-tight mb-6">
                Autonomous Agents That{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400">
                  Work While You Sleep
                </span>
              </h1>

              <p className="text-[1.05rem] text-slate-400 leading-[1.85] mb-5">
                AI agents are programs that pursue goals — not just respond to inputs. We build agents
                that can research a topic, draft a report, update your CRM, send a follow-up email,
                and flag exceptions, all as a single uninterrupted workflow triggered by one instruction.
              </p>

              <p className="text-[0.95rem] text-slate-500 leading-[1.85]">
                Unlike basic automation scripts, our agents reason about what to do next, recover from
                unexpected states, and integrate with your real systems — making them robust enough
                for production use, not just demos.
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
                Any operation with high-volume, multi-step tasks that require judgement is a strong fit.
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
              <h2 className="text-[1.2rem] font-black text-white mb-2">Agent capabilities</h2>
              <p className="text-[0.85rem] text-slate-500 mb-5">
                We build agents that use a combination of these capabilities, composed for your use case.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  { label: 'Web Browsing',      sub: 'Real-time research' },
                  { label: 'Code Execution',    sub: 'Data processing' },
                  { label: 'API Calling',        sub: 'System integration' },
                ].map(l => (
                  <div
                    key={l.label}
                    className="px-5 py-3 bg-emerald-500/8 border border-emerald-500/18 rounded-xl text-center min-w-[130px]"
                  >
                    <p className="text-[0.85rem] font-black text-emerald-300">{l.label}</p>
                    <p className="text-[0.65rem] text-emerald-500/60 mt-0.5">{l.sub}</p>
                  </div>
                ))}
              </div>
              <p className="text-[0.74rem] text-slate-600 leading-relaxed">
                Built on: OpenAI · Anthropic Claude · LangChain · custom orchestration — we select the stack that matches your reliability and cost requirements.
              </p>
            </div>

          </div>

          {/* ══ RIGHT ══ */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-4">

              <div className="bg-slate-900 border border-white/8 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

                <div className="bg-gradient-to-br from-emerald-950/50 to-slate-900 px-7 py-7 border-b border-white/8">
                  <p className="text-[0.68rem] font-black text-emerald-400/80 uppercase tracking-widest mb-2">
                    Starting at
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[3.2rem] font-black text-white leading-none">$3,499</span>
                    <span className="text-slate-400 text-sm">one-time</span>
                  </div>
                  <p className="text-[0.75rem] text-slate-500 leading-relaxed">
                    Final price confirmed after the scoping call based on task complexity,
                    number of integrations, and required reasoning depth.
                  </p>
                </div>

                <div className="px-7 py-6 border-b border-white/8">
                  <p className="text-[0.68rem] font-black text-slate-500 uppercase tracking-widest mb-4">
                    What's included
                  </p>
                  <ul className="space-y-2.5">
                    {INCLUDED.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-[0.82rem] text-slate-300">
                        <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-white font-black text-[1rem] mb-1.5">Sign in to book your call</h3>
                      <p className="text-slate-500 text-[0.8rem] leading-relaxed mb-5">
                        We already have your details from your account — just sign in and you're one step away.
                      </p>
                      <button
                        onClick={() => navigate('/login', { state: { next: '/service/ai-agents' } })}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[0.88rem] py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/25 mb-3"
                      >
                        Sign In
                      </button>
                      <a href="/register" className="text-[0.78rem] text-slate-500 hover:text-emerald-400 transition-colors">
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
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[0.85rem] font-black shrink-0 shadow-lg shadow-emerald-600/30">
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
                          placeholder="e.g. Agent to research competitors daily, write a briefing, and post to Slack automatically…"
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
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[0.9rem] py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40"
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
