import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../animations/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'

const ScrollContext = createContext(null)
// eslint-disable-next-line react/only-export-components
export const useScroll = () => useContext(ScrollContext)

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null)
  const lockedRef = useRef(false)
  const reduced = useReducedMotion()

  // Pause the site-wide colour pulse (see pulse.css) while scrolling; it resumes 140ms after the last scroll.
  useEffect(() => {
    const root = document.documentElement
    let timer = 0
    const onScroll = () => {
      root.classList.add('is-scrolling')
      clearTimeout(timer)
      timer = setTimeout(() => root.classList.remove('is-scrolling'), 140)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(timer); root.classList.remove('is-scrolling') }
  }, [])

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    if (lockedRef.current) lenis.stop()
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const scrollTo = useCallback((target, opts = {}) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    const lenis = lenisRef.current
    if (lenis) {
      lenis.scrollTo(el ?? target, { offset: 0, duration: 1.6, ...opts })
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'auto' })
    } else {
      el?.scrollIntoView({ behavior: 'auto' })
    }
    // Move keyboard focus along with the view.
    if (el && opts.focus !== false) {
      el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
    }
  }, [])

  const lock = useCallback(() => {
    lockedRef.current = true
    lenisRef.current?.stop()
    document.documentElement.classList.add('is-locked')
  }, [])

  const unlock = useCallback(() => {
    lockedRef.current = false
    lenisRef.current?.start()
    document.documentElement.classList.remove('is-locked')
  }, [])

  const value = useMemo(() => ({ scrollTo, lock, unlock }), [scrollTo, lock, unlock])
  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
}
