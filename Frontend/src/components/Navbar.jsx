import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { label: 'Home',         type: 'home' },
  { label: 'How It Works', type: 'scroll',   hash: 'process' },
  { label: 'Services',     type: 'scroll',   hash: 'services' },
  { label: 'Contact',      type: 'navigate', to: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user, checking, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  function handleNavClick(e, link) {
    e.preventDefault()
    if (link.type === 'home') {
      navigate('/')
      setTimeout(() => window.__lenis?.scrollTo(0), 50)
    } else if (link.type === 'navigate') {
      navigate(link.to)
    } else if (link.type === 'scroll') {
      if (location.pathname === '/') {
        const el = document.getElementById(link.hash)
        if (el) {
          window.__lenis
            ? window.__lenis.scrollTo(el, { offset: -80 })
            : el.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        navigate('/', { state: { scrollTo: link.hash } })
      }
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/8'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 py-4 grid grid-cols-3 items-center">

        {/* Left — Logo */}
        <div className="flex items-center">
          <a href="/" className="text-[1.15rem] font-black tracking-tight leading-none">
            <span className="text-blue-400">AI</span>
            <span className="text-white"> Automation Labs</span>
          </a>
        </div>

        {/* Mid — Nav links */}
        <ul className="flex items-center justify-center gap-9">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.type === 'navigate' ? link.to : link.type === 'home' ? '/' : `#${link.hash}`}
                onClick={(e) => handleNavClick(e, link)}
                className="text-[0.9rem] font-semibold text-white/70 hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 rounded-full transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* Right — Auth buttons */}
        <div className="flex items-center justify-end gap-3">

          {/* Skeleton while /me is in-flight — prevents Login flash */}
          {checking ? (
            <div className="w-44 h-9 bg-white/5 rounded-xl animate-pulse" />
          ) : user ? (
            /* ── Logged in state ── */
            <>
              {/* Avatar + name */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[0.8rem] font-black shrink-0 shadow-lg shadow-blue-600/30">
                  {user.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-[0.875rem] font-semibold text-white/90 max-w-[110px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-[0.875rem] font-semibold text-white/80 border-2 border-white/20 rounded-xl px-5 py-2 hover:bg-white/8 hover:border-white/35 transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            /* ── Logged out state ── */
            <>
              <a
                href="/login"
                className="text-[0.875rem] font-semibold text-white/80 border-2 border-white/20 rounded-xl px-6 py-2.5 hover:bg-white/8 hover:border-white/35 transition-all duration-200 inline-block"
              >
                Login
              </a>
              <a
                href="/register"
                className="text-[0.875rem] font-semibold text-white bg-blue-600 rounded-xl px-6 py-2.5 hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/30 inline-block"
              >
                Get Started
              </a>
            </>
          )}

        </div>
      </div>
    </nav>
  )
}
