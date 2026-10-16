import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, LazyMotion, domAnimation, m as motion } from 'motion/react'
import { chapters, identity } from '../data/identity'
import maskMe from '../assets/zine/hollow-me.webp'
import { useScroll } from './SmoothScroll'
import { gsap, ScrollTrigger, useGSAP } from '../animations/gsap'
import { useReducedMotion } from '../hooks/useMediaQuery'
import '../styles/navigation.css'

export default function Navigation() {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const { scrollTo, lock, unlock } = useScroll()
  const progress = useRef(null)
  const menuBtn = useRef(null)
  const reduced = useReducedMotion()

  // Active chapter: a thin band across the middle of the viewport.
  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-48% 0px -48% 0px' },
    )
    els.forEach((el) => io.observe(el))
    const top = document.getElementById('top')
    const ioTop = new IntersectionObserver(([e]) => e.isIntersecting && setActive(''), { rootMargin: '-48% 0px -48% 0px' })
    if (top) ioTop.observe(top)
    return () => { io.disconnect(); ioTop.disconnect() }
  }, [])

  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(progress.current, { scaleY: self.progress }),
    })
  })

  // Fullscreen menu: lock scroll, focus first link, close on Escape.
  useEffect(() => {
    if (!open) return
    lock()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => document.querySelector('#mobile-menu a')?.focus(), 60)
    const btn = menuBtn.current
    return () => {
      clearTimeout(t)
      unlock()
      window.removeEventListener('keydown', onKey)
      btn?.focus({ preventScroll: true })
    }
  }, [open, lock, unlock])

  const go = (id) => {
    setOpen(false)
    // Wait a frame so the menu's scroll lock is released first.
    requestAnimationFrame(() => scrollTo(`#${id}`))
  }

  return (
    <>
      <header className="topbar">
        <a
          className="brand"
          href="#top"
          onClick={(e) => { e.preventDefault(); go('top') }}
          aria-label={`${identity.lastName} ${identity.firstName} — back to top`}
        >
          <span className="brand__mono" aria-hidden="true">
            <span className="brand__l">H</span>
            <span className="brand__disc"><img className="brand__face" src={maskMe} alt="" draggable="false" /></span>
            <span className="brand__l">M</span>
          </span>
          <span className="brand__jp" aria-hidden="true">Portfolio</span>
        </a>
        <button
          ref={menuBtn}
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="menu-toggle__bars" aria-hidden="true"><i /><i /></span>
          {open ? 'Close' : 'Menu'}
        </button>
      </header>

      <nav className="rail" aria-label="Chapters">
        <span className="rail__track" aria-hidden="true"><span className="rail__fill" ref={progress} /></span>
        <ol>
          {chapters.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className={active === c.id ? 'is-active' : ''}
                aria-current={active === c.id ? 'true' : undefined}
                onClick={(e) => { e.preventDefault(); go(c.id) }}
              >
                <span className="rail__num">{c.num}</span>
                <span className="rail__title">{c.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Chapters"
            initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={reduced ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ol className="sheet__list">
              {chapters.map((c, i) => (
                <motion.li
                  key={c.id}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: reduced ? 0 : 0.25 + i * 0.05, duration: 0.5 }}
                >
                  <a href={`#${c.id}`} onClick={(e) => { e.preventDefault(); go(c.id) }} className={active === c.id ? 'is-active' : ''}>
                    <span className="sheet__num">{c.num}</span>
                    <span className="sheet__title">{c.title}</span>
                  </a>
                </motion.li>
              ))}
            </ol>
            <p className="sheet__foot">
              <a href={`mailto:${identity.email}`}>{identity.email}</a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      </LazyMotion>
    </>
  )
}
