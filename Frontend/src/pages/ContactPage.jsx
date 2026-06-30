import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../utils/apiFetch'

const API = import.meta.env.VITE_API_URL ?? ''

const SERVICE_OPTIONS = [
  { label: 'WhatsApp AI Automation',         value: 'whatsapp' },
  { label: 'Custom AI Chatbots',             value: 'chatbot' },
  { label: 'AI Strategy & Consulting',       value: 'consulting' },
  { label: 'AI Agent Development',           value: 'ai_agent' },
  { label: 'AI Customer Support Systems',    value: 'customer_support' },
  { label: 'Knowledge Base & RAG Systems',   value: 'rag' },
  { label: 'Not sure yet — I need guidance', value: 'other' },
]

const BULLETS = [
  {
    title: 'Free 30-minute discovery call',
    desc: 'No commitment, no sales pressure — just an honest conversation about your goals.',
  },
  {
    title: 'Custom AI strategy for your business',
    desc: 'We map the right solution to your exact use case, budget, and timeline.',
  },
  {
    title: 'Transparent pricing, no hidden fees',
    desc: 'You get a clear quote upfront. What we quote is what you pay.',
  },
  {
    title: 'End-to-end support — strategy to deployment',
    desc: 'One team handles everything from design and build to launch and maintenance.',
  },
]

const inputCls =
  'w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-[0.88rem] text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-1'
const okCls  = 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
const errCls = 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
const labelCls = 'block text-[0.72rem] font-bold text-slate-400 uppercase tracking-wider mb-1.5'

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function ContactPage() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    name:    user?.name    ?? '',
    email:   user?.email   ?? '',
    phone:   user?.phone   ?? '',
    company: '',
    service: '',
    message: '',
  })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Auth check may still be in-flight when this page mounts — sync once user resolves
  useEffect(() => {
    if (!user) return
    setForm(prev => ({
      ...prev,
      name:  prev.name  || user.name  || '',
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }))
  }, [user])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
    setApiError('')
  }

  function validate() {
    const e = {}
    if (!form.name.trim())    e.name    = 'Full name is required'
    if (!form.email.trim())   e.email   = 'Email address is required'
    else if (!form.email.includes('@')) e.email = 'Enter a valid email address'
    if (form.phone) {
      const digits = form.phone.replace(/\D/g, '')
      if (digits && digits.length !== 10) e.phone = 'Must be exactly 10 digits'
    }
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = 'Please tell us a bit about your project (at least 10 characters)'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')

    const phone   = form.phone.replace(/\D/g, '')
    const message = form.company.trim()
      ? `[Company: ${form.company.trim()}]\n\n${form.message.trim()}`
      : form.message.trim()

    try {
      const res  = await apiFetch(`${API}/api/services/inquiry`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service: form.service || 'other',
          name:    form.name.trim(),
          email:   form.email.trim().toLowerCase(),
          phone,
          message,
        }),
      })
      const data = await res.json()
      if (res.ok) { setSubmitted(true); return }
      setApiError(data.message ?? 'Something went wrong. Please try again.')
    } catch {
      setApiError('Network error — could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none select-none z-0" style={{ opacity: 0.025 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="contact-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.70" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#contact-grain)" />
        </svg>
      </div>

      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/6 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-36 pb-24">

        {/* Page header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 mb-5">
            <span className="h-px w-8 bg-blue-400" />
            <span className="text-[0.75rem] font-bold text-blue-400 uppercase tracking-[0.18em]">
              Get In Touch
            </span>
            <span className="h-px w-8 bg-blue-400" />
          </span>
          <h1 className="text-[3rem] font-black text-white leading-[1.1] tracking-tight">
            Book a Free{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Consultation
            </span>
          </h1>
          <p className="mt-4 text-[1rem] text-slate-400 max-w-xl mx-auto leading-relaxed">
            Tell us about your business and what you want to achieve with AI.
            We'll respond within 24 hours.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-5xl mx-auto">

          {/* Left — what to expect */}
          <div className="lg:pt-2">
            <h2 className="text-[1.4rem] font-black text-white mb-8">What to expect</h2>

            <ul className="space-y-6">
              {BULLETS.map(item => (
                <li key={item.title} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-blue-600/30">
                    <CheckIcon />
                  </div>
                  <div>
                    <p className="text-[0.9rem] font-bold text-white leading-snug">{item.title}</p>
                    <p className="text-[0.82rem] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex items-center gap-3 bg-blue-500/8 border border-blue-500/15 rounded-xl px-5 py-4">
              <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[0.82rem] text-blue-300 font-medium">
                We typically respond within <span className="font-black">24 hours</span> on business days.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/40">

            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-[1.3rem] font-black text-white mb-2">We'll be in touch soon!</h3>
                <p className="text-[0.875rem] text-slate-400 leading-relaxed mb-6">
                  Thanks for reaching out. Our team will contact you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setForm({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', company: '', service: '', message: '' })
                  }}
                  className="text-[0.82rem] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Submit another enquiry →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Name + Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      className={`${inputCls} ${errors.name ? errCls : okCls}`}
                      autoComplete="name"
                    />
                    {errors.name && <p className="mt-1 text-[0.72rem] text-red-400">{errors.name}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      className={`${inputCls} ${errors.email ? errCls : okCls}`}
                      autoComplete="email"
                    />
                    {errors.email && <p className="mt-1 text-[0.72rem] text-red-400">{errors.email}</p>}
                  </div>
                </div>

                {/* Phone + Company */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      readOnly={!!user?.phone}
                      className={`${inputCls} ${errors.phone ? errCls : okCls} ${user?.phone ? 'opacity-60 cursor-default' : ''}`}
                      autoComplete="tel"
                    />
                    {errors.phone && <p className="mt-1 text-[0.72rem] text-red-400">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Company</label>
                    <input
                      type="text"
                      placeholder="Your Company Ltd."
                      value={form.company}
                      onChange={e => set('company', e.target.value)}
                      className={`${inputCls} ${okCls}`}
                      autoComplete="organization"
                    />
                  </div>
                </div>

                {/* Service */}
                <div>
                  <label className={labelCls}>Service Interested In</label>
                  <div className="relative">
                    <select
                      value={form.service}
                      onChange={e => set('service', e.target.value)}
                      className={`${inputCls} ${okCls} appearance-none pr-10 cursor-pointer bg-slate-800/60`}
                    >
                      <option value="">Select a service…</option>
                      {SERVICE_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className={labelCls}>Tell Us About Your Project <span className="text-red-400">*</span></label>
                  <textarea
                    rows={4}
                    placeholder="Briefly describe your business and what you want to achieve with AI…"
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    className={`${inputCls} ${errors.message ? errCls : okCls} resize-none`}
                  />
                  {errors.message && <p className="mt-1 text-[0.72rem] text-red-400">{errors.message}</p>}
                </div>

                {apiError && (
                  <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-[0.78rem] text-red-400">{apiError}</p>
                  </div>
                )}

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
                      Sending…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Book My Free Call
                    </>
                  )}
                </button>

                <p className="text-center text-[0.72rem] text-slate-500 pt-1">
                  No spam. No commitment. We respond within 24 hours.
                </p>

              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
