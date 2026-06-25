import { useRef, useEffect } from 'react'

/**
 * Magnetic pull effect — element drifts toward the cursor
 * when it enters the threshold radius, then springs back.
 *
 * @param {number} threshold  px radius that activates the pull (default 70)
 * @param {number} strength   how far the element moves (0–1, default 0.38)
 */
export function useMagnetic({ threshold = 70, strength = 0.38 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId = null
    let x = 0, y = 0   // current rendered position
    let tx = 0, ty = 0  // target position
    let inZone = false

    el.style.willChange = 'transform'

    const lerp = (a, b, t) => a + (b - a) * t

    const tick = () => {
      x = lerp(x, tx, 0.13)
      y = lerp(y, ty, 0.13)

      el.style.transform = `translate(${x.toFixed(3)}px, ${y.toFixed(3)}px)`

      const settled = Math.abs(x - tx) < 0.05 && Math.abs(y - ty) < 0.05

      if (!settled || inZone) {
        rafId = requestAnimationFrame(tick)
      } else {
        // Snapped back to origin — restore CSS transition and stop loop
        x = 0; y = 0
        el.style.transform = 'translate(0px, 0px)'
        el.style.transition = ''
        rafId = null
      }
    }

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)

      if (dist < threshold) {
        if (!inZone) {
          // Entering zone — disable CSS transition on transform so JS lerp is smooth
          el.style.transition = 'background-color 200ms, border-color 200ms, color 200ms, box-shadow 200ms'
        }
        inZone = true
        tx = dx * strength
        ty = dy * strength
      } else {
        inZone = false
        tx = 0
        ty = 0
      }

      if (!rafId) rafId = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafId) cancelAnimationFrame(rafId)
      el.style.transform = ''
      el.style.transition = ''
      el.style.willChange = ''
    }
  }, [threshold, strength])

  return ref
}
