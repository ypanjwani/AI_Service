/* ─────────────────────────────────────────────
   SERVICES CONFIG
   ↓ Paste your Pinterest / Unsplash image URL
     into each service's imageUrl field.

   Suggested Pinterest searches:
   0 → "WhatsApp business automation"  services[0].imageUrl
   1 → "AI chatbot interface"          services[1].imageUrl
   2 → "business automation AI"        services[2].imageUrl
   3 → "AI agent technology"           services[3].imageUrl
   4 → "AI customer support"           services[4].imageUrl
   5 → "knowledge base AI"             services[5].imageUrl
───────────────────────────────────────────── */
const services = [
  {
    number: '01',
    title: 'WhatsApp AI Automation',
    desc: 'Turn WhatsApp into a 24/7 sales and operations engine — automated funnels, order management, lead qualification, and personalised broadcast campaigns.',
    imageUrl: '',
    href: '/service/whatsapp-ai',
  },
  {
    number: '02',
    title: 'Custom AI Chatbots',
    desc: 'Domain-trained conversational AI built on your data — handling support, lead generation, and sales in multiple languages, around the clock.',
    imageUrl: '',
    href: '/service/chatbot',
  },
  {
    number: '03',
    title: 'AI Strategy & Consulting',
    desc: 'Strategic AI roadmapping and workflow automation tailored to eliminate bottlenecks and boost operational efficiency.',
    imageUrl: '',
    href: '/service/consulting',
  },
  {
    number: '04',
    title: 'AI Agent Development',
    desc: 'Autonomous AI agents that execute complex multi-step tasks, make real-time decisions, and integrate with your stack.',
    imageUrl: '',
    href: '/service/ai-agents',
  },
  {
    number: '05',
    title: 'AI Customer Support Systems',
    desc: 'AI that resolves 60–80% of tickets automatically across chat, WhatsApp, and email — and routes the rest to your team with full context attached.',
    imageUrl: '',
    href: '/service/customer-support',
  },
  {
    number: '06',
    title: 'Knowledge Base & RAG Systems',
    desc: 'Retrieval-Augmented Generation pipelines that give your AI instant, accurate access to your company knowledge.',
    imageUrl: '',
    href: '/service/rag-systems',
  },
]

/* ─── Image placeholder (dark theme) ─── */
function ImagePlaceholder({ index }) {
  return (
    <div className="w-full h-52 bg-slate-800/60 flex flex-col items-center justify-center gap-3 border-b border-white/5">
      <div className="w-12 h-12 rounded-2xl bg-slate-700/60 border border-white/8 flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <p className="text-[10px] font-mono text-slate-600 tracking-wide">
        services[{index}].imageUrl
      </p>
    </div>
  )
}

/* ─── Services Section ─── */
import { Link } from 'react-router-dom'

export default function ServicesSection() {
  return (
    <section id="services" className="relative bg-slate-950 py-28 overflow-hidden">

      {/* ── Background layers ── */}
      <div className="absolute inset-0 pointer-events-none select-none">

        {/* 1. Depth gradient — top navy fades to a slightly deeper navy at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(2,6,23,0.60) 100%)',
          }}
        />

        {/* 2. Dot grid — very faint, 30px pitch */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* 3. Film grain — SVG fractal noise for premium texture */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.04 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="services-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.70"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#services-grain)" />
        </svg>

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/6 rounded-full blur-3xl" />

      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8">

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 mb-5">
            <span className="h-px w-8 bg-blue-500" />
            <span className="text-[0.75rem] font-bold text-blue-400 uppercase tracking-[0.2em]">
              What We Offer
            </span>
            <span className="h-px w-8 bg-blue-500" />
          </span>
          <h2 className="text-[2.8rem] font-black text-white leading-tight tracking-tight">
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              AI Services
            </span>
          </h2>
          <p className="mt-4 text-[1rem] font-medium text-slate-400 max-w-xl mx-auto leading-relaxed">
            Cutting-edge AI solutions engineered to transform your business
            operations, reduce costs, and accelerate growth.
          </p>
        </div>

        {/* 3 × 2 card grid */}
        <div className="grid grid-cols-3 gap-6">
          {services.map((service, i) => (
            <Link
              key={i}
              to={service.href ?? '#'}
              className="group bg-slate-900 border border-white/6 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-350 block"
            >
              {/* Image */}
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <ImagePlaceholder index={i} />
              )}

              {/* Card body */}
              <div className="p-6">

                {/* Number + title row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-[1.05rem] font-black text-white leading-snug">
                    {service.title}
                  </h3>
                  <span className="text-[0.68rem] font-black text-slate-600 tracking-widest mt-0.5 shrink-0">
                    {service.number}
                  </span>
                </div>

                <p className="text-[0.85rem] font-medium text-slate-400 leading-relaxed">
                  {service.desc}
                </p>

                {/* CTA */}
                <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
                  <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-slate-500 group-hover:text-blue-400 transition-colors duration-200">
                    Learn more
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
