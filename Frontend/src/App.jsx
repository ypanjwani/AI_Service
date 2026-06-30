import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider, useAuth } from './context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
if (!GOOGLE_CLIENT_ID) console.warn('VITE_GOOGLE_CLIENT_ID is not set — Google sign-in will not work')
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import StepsSection from './components/StepsSection'
import ServicesSection from './components/ServicesSection'
import RegisterPage           from './pages/RegisterPage'
import LoginPage              from './pages/LoginPage'
import ForgotPasswordPage     from './pages/ForgotPasswordPage'
import ResetPasswordPage      from './pages/ResetPasswordPage'
import ChatbotServicePage     from './pages/ChatbotServicePage'
import WhatsAppAIPage           from './pages/WhatsAppAIPage'
import ConsultingServicePage   from './pages/ConsultingServicePage'
import AIAgentsServicePage     from './pages/AIAgentsServicePage'
import CustomerSupportServicePage from './pages/CustomerSupportServicePage'
import RAGSystemsServicePage    from './pages/RAGSystemsServicePage'
import AIWebsitesServicePage    from './pages/AIWebsitesServicePage'
import MultilingualServicePage  from './pages/MultilingualServicePage'
import ContactPage              from './pages/ContactPage'

/* Redirects to /login if not authenticated.
   Passes the attempted path so LoginPage can redirect back after login. */
function ProtectedRoute({ children }) {
  const { user, checking } = useAuth()
  const location = useLocation()

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ next: location.pathname }} replace />
  }

  return children
}

function HomePage() {
  const location = useLocation()

  useEffect(() => {
    const target = location.state?.scrollTo
    if (!target) return
    const el = document.getElementById(target)
    if (!el) return
    const timer = setTimeout(() => {
      if (window.__lenis) {
        window.__lenis.scrollTo(el, { offset: -80 })
      } else {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [location.state])

  return (
    <>
      <HeroSection />
      <StepsSection />
      <ServicesSection />
    </>
  )
}

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    window.__lenis = lenis

    let raf
    function loop(time) {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <div className="bg-slate-950">
            <Navbar />
            <Routes>
              <Route path="/"                element={<HomePage />} />
              <Route path="/register"         element={<RegisterPage />} />
              <Route path="/login"            element={<LoginPage />} />
              <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
              <Route path="/reset-password"   element={<ResetPasswordPage />} />
              <Route path="/service/chatbot"      element={<ChatbotServicePage />} />
              <Route path="/service/whatsapp-ai"      element={<WhatsAppAIPage />} />
              <Route path="/service/consulting"       element={<ConsultingServicePage />} />
              <Route path="/service/ai-agents"        element={<AIAgentsServicePage />} />
              <Route path="/service/customer-support" element={<CustomerSupportServicePage />} />
              <Route path="/service/rag-systems"      element={<RAGSystemsServicePage />} />
              <Route path="/service/ai-websites"      element={<AIWebsitesServicePage />} />
              <Route path="/service/multilingual"     element={<MultilingualServicePage />} />
              <Route path="/contact"                  element={<ContactPage />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}
