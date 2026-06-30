import { useNavigate } from 'react-router-dom'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">

      {/* ── VIDEO BACKGROUND ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <video
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover"
          style={{ width: 'max(100vw, 177.78vh)', height: 'max(100vh, 56.25vw)' }}
          src="/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>

      {/* ── OVERLAYS — text readability ── */}

      {/* 1. Flat dark base */}
      <div className="absolute inset-0 bg-black/70" style={{ zIndex: 2 }} />

      {/* 2. Centre-bright vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            'radial-gradient(ellipse 75% 65% at 50% 48%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* 3. Soft top bar shadow */}
      <div
        className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* 4. Bottom fade into dark next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"
        style={{ zIndex: 3 }}
      />

      {/* ── HERO CONTENT ── */}
      <div className="relative text-center max-w-5xl mx-auto px-8" style={{ zIndex: 10 }}>

        <h1
          className="text-[4.8rem] font-black text-white leading-[1.06] tracking-tight"
          style={{ textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}
        >
          Transform Your Business<br />
          with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400">
            Intelligent AI
          </span>
        </h1>

        <p
          className="mt-7 text-[1.15rem] font-medium text-white/82 leading-[1.9] max-w-2xl mx-auto"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
        >
          Harness the full power of artificial intelligence to automate workflows,
          uncover deep insights, and deliver exceptional experiences — at the speed
          of modern business.
        </p>

        <div className="mt-11 flex items-center justify-center gap-5">
          <button
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[0.95rem] px-9 py-4 rounded-xl shadow-2xl shadow-blue-600/50 hover:shadow-blue-500/60 transition-all duration-200"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Book a Free Call
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('services')
              if (el) {
                window.__lenis
                  ? window.__lenis.scrollTo(el, { offset: -80 })
                  : el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
            className="inline-flex items-center gap-2.5 border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 backdrop-blur-sm font-bold text-[0.95rem] px-9 py-4 rounded-xl transition-all duration-200"
          >
            Our Services
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

      </div>

      {/* ── Scroll indicator ── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

    </section>
  )
}
