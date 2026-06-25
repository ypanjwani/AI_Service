import { useRef, useEffect } from 'react'
import gsap from 'gsap'

/* ─────────────────────────────────────────────────────────────────
   GeoLayer
   Inspired by: low-poly crystal gem clusters in corners +
   scattered thin-stroke wireframe triangles (ref: image.png)
   Adapted to dark-blue theme (slate-900 bg, indigo accents).
───────────────────────────────────────────────────────────────── */
function GeoLayer({ layerRef }) {
  return (
    <div
      ref={layerRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ willChange: 'transform' }}
    >
      <svg
        width="100%" height="100%"
        viewBox="0 0 1440 750"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="steps-dot-grid"
            x="0" y="0" width="32" height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="16" cy="16" r="1.5" fill="rgba(255,255,255,0.04)" />
          </pattern>
        </defs>

        {/* ── Dot grid ── */}
        <rect width="1440" height="750" fill="url(#steps-dot-grid)" />

        {/* ══════════════════════════════════════════════
            TOP-LEFT CRYSTAL CLUSTER
            Low-poly gem facets inspired by the corner
            crystals in the reference image — adapted to
            indigo/blue on dark background.
        ══════════════════════════════════════════════ */}
        <g strokeWidth="0.8">
          {/* Facet 1 — darkest */}
          <polygon points="-10,65 35,10 90,48"
            fill="rgba(99,102,241,0.07)" stroke="rgba(99,102,241,0.18)" />
          {/* Facet 2 */}
          <polygon points="35,10 115,22 90,48"
            fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.15)" />
          {/* Facet 3 — lighter, catches "light" */}
          <polygon points="115,22 155,72 90,48"
            fill="rgba(99,102,241,0.11)" stroke="rgba(99,102,241,0.20)" />
          {/* Facet 4 */}
          <polygon points="-10,65 90,48 75,125"
            fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.15)" />
          {/* Facet 5 — brightest highlight */}
          <polygon points="90,48 155,72 125,135"
            fill="rgba(99,102,241,0.13)" stroke="rgba(99,102,241,0.22)" />
          {/* Facet 6 */}
          <polygon points="75,125 125,135 55,185"
            fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.16)" />
          {/* Facet 7 — shadow side */}
          <polygon points="-10,65 75,125 -35,140"
            fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.12)" />
          {/* Facet 8 — upper-right shard */}
          <polygon points="115,22 185,0 155,72"
            fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.14)" />
          {/* Facet 9 — top tip */}
          <polygon points="35,10 115,22 70,-18"
            fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.10)" />
          {/* Facet 10 — far shard */}
          <polygon points="155,72 210,55 185,140"
            fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.11)" />
        </g>

        {/* ══════════════════════════════════════════════
            BOTTOM-RIGHT CRYSTAL CLUSTER
            Mirror concept — different vertex layout
            so both clusters feel distinct.
        ══════════════════════════════════════════════ */}
        <g strokeWidth="0.8">
          <polygon points="1450,685 1400,740 1345,700"
            fill="rgba(99,102,241,0.07)" stroke="rgba(99,102,241,0.18)" />
          <polygon points="1400,740 1325,755 1345,700"
            fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.14)" />
          <polygon points="1345,700 1325,755 1285,695"
            fill="rgba(99,102,241,0.11)" stroke="rgba(99,102,241,0.20)" />
          <polygon points="1450,685 1345,700 1375,615"
            fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.15)" />
          <polygon points="1345,700 1285,695 1305,630"
            fill="rgba(99,102,241,0.13)" stroke="rgba(99,102,241,0.22)" />
          <polygon points="1375,615 1345,700 1305,630"
            fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.17)" />
          <polygon points="1450,685 1375,615 1465,600"
            fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.12)" />
          <polygon points="1285,695 1325,755 1255,745"
            fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.14)" />
          <polygon points="1305,630 1285,695 1255,635"
            fill="rgba(99,102,241,0.04)" stroke="rgba(99,102,241,0.10)" />
          <polygon points="1400,740 1325,755 1420,770"
            fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.11)" />
        </g>

        {/* ══════════════════════════════════════════════
            SCATTERED WIREFRAME TRIANGLES
            Thin-stroke outline triangles at various
            sizes and rotations — directly inspired by
            the floating triangles in the reference image.
        ══════════════════════════════════════════════ */}
        <g fill="none" strokeWidth="1">
          {/* Large — frames the upper-center area (like the big triangle in the image) */}
          <polygon points="720,55 530,355 910,355"
            stroke="rgba(99,102,241,0.08)" />
          {/* Large — lower-left, tilted */}
          <polygon points="160,310 60,560 370,530"
            stroke="rgba(99,102,241,0.07)" />
          {/* Large — right side */}
          <polygon points="1290,210 1110,480 1440,460"
            stroke="rgba(99,102,241,0.07)" />

          {/* Medium — upper-left floating */}
          <polygon points="280,100 195,230 375,225"
            stroke="rgba(99,102,241,0.09)" strokeWidth="0.8" />
          {/* Medium — upper-right */}
          <polygon points="1130,90 1060,195 1205,190"
            stroke="rgba(99,102,241,0.09)" strokeWidth="0.8" />
          {/* Medium — lower-center */}
          <polygon points="680,580 595,700 770,695"
            stroke="rgba(99,102,241,0.08)" strokeWidth="0.8" />

          {/* Small — scattered for depth */}
          <polygon points="840,42 800,105 882,102"
            stroke="rgba(99,102,241,0.07)" strokeWidth="0.7" />
          <polygon points="420,640 390,695 452,692"
            stroke="rgba(99,102,241,0.07)" strokeWidth="0.7" />
          <polygon points="1010,620 980,672 1042,669"
            stroke="rgba(99,102,241,0.06)" strokeWidth="0.7" />
          <polygon points="520,80 498,118 544,115"
            stroke="rgba(99,102,241,0.06)" strokeWidth="0.7" />
        </g>

      </svg>
    </div>
  )
}

/* ─── Step data ─── */
const steps = [
  {
    number: '01',
    title: 'Book a Free Call',
    desc: 'Schedule a no-obligation discovery call with our AI experts to discuss your goals and explore what is possible for your business.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'We Design Your Solution',
    desc: 'Our team crafts a tailored AI strategy and solution blueprint aligned precisely with your business model and long-term goals.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'You Scale with AI',
    desc: 'Launch your AI-powered system and watch your business grow faster, smarter, and more efficiently than ever before.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
]

function ArrowConnector() {
  return (
    <div className="flex items-center justify-center shrink-0 w-14 relative z-10">
      <div className="flex items-center gap-1.5">
        <div className="w-8 h-px bg-gradient-to-r from-blue-600/30 to-blue-500/70" />
        <svg className="w-4 h-4 text-blue-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}

/* ─── Steps Section ─── */
export default function StepsSection() {
  const sectionRef = useRef(null)
  const layerRef   = useRef(null)

  /* ── GSAP parallax on mouse move ── */
  useEffect(() => {
    const section = sectionRef.current
    const layer   = layerRef.current
    if (!section || !layer) return

    const xTo = gsap.quickTo(layer, 'x', { duration: 1.2, ease: 'power2.out' })
    const yTo = gsap.quickTo(layer, 'y', { duration: 1.2, ease: 'power2.out' })

    const onMove = (e) => {
      const { left, top, width, height } = section.getBoundingClientRect()
      const nx = (e.clientX - left  - width  / 2) / width
      const ny = (e.clientY - top   - height / 2) / height
      xTo(nx * 16)
      yTo(ny * 10)
    }
    const onLeave = () => { xTo(0); yTo(0) }

    section.addEventListener('mousemove',  onMove,  { passive: true })
    section.addEventListener('mouseleave', onLeave, { passive: true })
    return () => {
      section.removeEventListener('mousemove',  onMove)
      section.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section id="process" ref={sectionRef} className="relative bg-slate-900 py-24 overflow-hidden">

      {/* ── Geometric background layer (z-0) ── */}
      <GeoLayer layerRef={layerRef} />

      {/* ── Ambient centre glow ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-600/6 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ── Content (z-10) ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8">

        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 mb-5">
            <span className="h-px w-8 bg-blue-500" />
            <span className="text-[0.75rem] font-bold text-blue-400 uppercase tracking-[0.2em]">
              How It Works
            </span>
            <span className="h-px w-8 bg-blue-500" />
          </span>
          <h2 className="text-[2.6rem] font-black text-white leading-tight tracking-tight">
            3 Simple{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Steps
            </span>{' '}
            to Get Started
          </h2>
          <p className="mt-4 text-[1rem] font-medium text-slate-400 max-w-lg mx-auto leading-relaxed">
            From your first call to a fully scaled AI system — our streamlined
            process gets you results fast.
          </p>
        </div>

        {/* Steps row */}
        <div className="flex items-stretch gap-0">
          {steps.flatMap((step, i) => [
            <div
              key={step.number}
              className="flex-1 relative bg-slate-800/40 border border-white/6 rounded-2xl p-8 overflow-hidden group hover:border-blue-500/25 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/8 transition-all duration-350"
            >
              <span className="absolute -top-3 -right-1 text-[8rem] font-black text-white/[0.04] leading-none select-none pointer-events-none">
                {step.number}
              </span>

              <div className="flex items-center justify-between mb-6">
                <span className="text-[0.7rem] font-black text-blue-400 uppercase tracking-[0.22em] bg-blue-500/10 border border-blue-500/15 px-3 py-1.5 rounded-full">
                  Step {step.number}
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500/40 group-hover:bg-blue-400 group-hover:scale-125 transition-all duration-300" />
              </div>

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/25 group-hover:scale-105 group-hover:shadow-blue-600/40 transition-all duration-300">
                {step.icon}
              </div>

              <h3 className="relative z-10 text-[1.18rem] font-black text-white leading-snug mb-3">
                {step.title}
              </h3>
              <p className="relative z-10 text-[0.875rem] font-medium text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>,

            ...(i < steps.length - 1 ? [<ArrowConnector key={`a-${i}`} />] : []),
          ])}
        </div>

      </div>
    </section>
  )
}
