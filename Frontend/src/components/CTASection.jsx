import { useState } from 'react'

const serviceOptions = [
  'AI Websites',
  'Chatbot Development',
  'AI Consulting & Automation',
  'AI Agent Development',
  'Multilingual AI Solutions',
  'Knowledge Base & RAG Systems',
  'Not sure yet — I need guidance',
]

const bullets = [
  'Completely free first call — no commitment',
  'Tailored AI strategy built for your business',
  'Transparent pricing with no hidden fees',
  'End-to-end support from strategy to deployment',
]

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )
}

const inputClass =
  'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[0.88rem] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'

const labelClass =
  'block text-[0.72rem] font-black text-slate-500 uppercase tracking-[0.12em] mb-1.5'

export default function CTASection() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', service: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire up to your backend / email service
    setSubmitted(true)
  }

  return (
    <section id="contact" className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-24 overflow-hidden">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 gap-16 items-center">

          {/* ── Left — CTA copy ── */}
          <div>
            <span className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-8 bg-blue-400" />
              <span className="text-[0.78rem] font-bold text-blue-400 uppercase tracking-[0.18em]">
                Get In Touch
              </span>
              <span className="h-px w-8 bg-blue-400" />
            </span>

            <h2 className="text-[2.8rem] font-black text-white leading-[1.1] tracking-tight">
              Ready to Transform<br />
              Your Business{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                with AI?
              </span>
            </h2>

            <p className="mt-5 text-[1rem] font-medium text-slate-400 leading-[1.85] max-w-md">
              Book a free discovery call and let our AI experts design
              a custom solution that fits your exact business needs and goals.
            </p>

            <ul className="mt-9 space-y-4">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon />
                  </div>
                  <span className="text-[0.9rem] font-medium text-slate-300 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right — Lead Gen Form ── */}
          <div>
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-8">

              {submitted ? (
                /* Success state */
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-[1.3rem] font-black text-slate-900">We'll be in touch soon!</h3>
                  <p className="text-[0.875rem] text-slate-500 mt-2 leading-relaxed">
                    Thank you for reaching out. Our team will contact you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name:'', email:'', phone:'', company:'', service:'', message:'' }) }}
                    className="mt-6 text-[0.82rem] font-bold text-blue-600 hover:underline"
                  >
                    Submit another enquiry
                  </button>
                </div>
              ) : (
                <>
                  {/* Form header */}
                  <div className="mb-7">
                    <h3 className="text-[1.25rem] font-black text-slate-900">Book a Free Call</h3>
                    <p className="text-[0.82rem] text-slate-500 mt-1">
                      Fill in your details and we'll reach out within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Row 1: Name + Email */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Full Name <span className="text-blue-600">*</span></label>
                        <input
                          type="text" name="name" required
                          placeholder="John Smith"
                          value={form.name} onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Email Address <span className="text-blue-600">*</span></label>
                        <input
                          type="email" name="email" required
                          placeholder="john@company.com"
                          value={form.email} onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone + Company */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Phone Number</label>
                        <input
                          type="tel" name="phone"
                          placeholder="+1 (555) 000-0000"
                          value={form.phone} onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Company Name</label>
                        <input
                          type="text" name="company"
                          placeholder="Your Company Ltd."
                          value={form.company} onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Service dropdown */}
                    <div>
                      <label className={labelClass}>Service Interested In</label>
                      <div className="relative">
                        <select
                          name="service"
                          value={form.service} onChange={handleChange}
                          className={`${inputClass} appearance-none pr-10 cursor-pointer bg-white`}
                        >
                          <option value="">Select a service…</option>
                          {serviceOptions.map(s => (
                            <option key={s} value={s}>{s}</option>
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
                      <label className={labelClass}>Tell Us About Your Project</label>
                      <textarea
                        name="message" rows={3}
                        placeholder="Briefly describe your business and what you want to achieve with AI…"
                        value={form.message} onChange={handleChange}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[0.9rem] py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 flex items-center justify-center gap-2.5 mt-1"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Book My Free Call
                    </button>

                    <p className="text-center text-[0.73rem] text-slate-400 pt-1">
                      No spam. No commitment. We respond within 24 hours.
                    </p>

                  </form>
                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
