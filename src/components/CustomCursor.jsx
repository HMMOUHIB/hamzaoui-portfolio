import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsap'
import { useFinePointer, useReducedMotion } from '../hooks/useMediaQuery'
import '../styles/cursor.css'

const INTERACTIVE = 'a, button, [role="tab"], [data-cursor]'
const REST_ANGLE = -45 // degrees: tip up-left, like a normal pointer, when nothing is moving
const EMBERS = 10
const KUNAI_TAIL = 27 // px from the tip back to the ring, where the flames burn

/**
 * A flaming kunai. Drawn pointing up with the tip on the pointer position; it swings to face the
 * direction of travel, its flames burn behind it, and embers shed off the tail while it moves.
 */
function Kunai() {
  return (
    <svg className="kunai" viewBox="0 0 60 160" aria-hidden="true">
      <defs>
        <linearGradient id="kunai-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" style={{ stopColor: 'var(--glow)' }} />
          <stop offset="1" style={{ stopColor: 'var(--glow-b)', stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="kunai-blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9e4ff" />
          <stop offset="0.5" stopColor="#fff" />
          <stop offset="1" stopColor="#bfb6ee" />
        </linearGradient>
      </defs>

      <g className="kunai__flames">
        <path className="kunai__flame kunai__flame--l" d="M23 100 C13 109 13 123 20 141 C27 126 30 111 23 100 Z" fill="url(#kunai-flame)" />
        <path className="kunai__flame kunai__flame--r" d="M37 100 C47 109 47 123 40 141 C33 126 30 111 37 100 Z" fill="url(#kunai-flame)" />
        <path className="kunai__flame kunai__flame--c" d="M30 100 C21 112 21 130 30 158 C39 130 39 112 30 100 Z" fill="url(#kunai-flame)" />
      </g>

      {/* blade, neck, wrapped grip, ring */}
      <path d="M30 0 L40 32 L30 60 L20 32 Z" fill="url(#kunai-blade)" className="kunai__blade" />
      <path d="M30 4 V56" className="kunai__fuller" />
      <rect x="27" y="60" width="6" height="26" rx="1.5" className="kunai__grip" />
      <path d="M27 66 H33 M27 72 H33 M27 78 H33" className="kunai__wrap" />
      <circle cx="30" cy="93" r="8" className="kunai__ring" />
    </svg>
  )
}

export default function CustomCursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced
  const ring = useRef(null)
  const embers = useRef(null)
  const [label, setLabel] = useState('')
  const [mode, setMode] = useState('idle')

  useEffect(() => {
    if (!enabled) return undefined
    document.documentElement.classList.add('has-cursor')
    const kunai = ring.current.querySelector('.kunai')
    const sparks = [...embers.current.children]
    const target = { x: 0, y: 0 }
    const prev = { x: 0, y: 0 }
    const vel = { x: 0, y: 0 } // smoothed pointer velocity, px per frame
    let angle = REST_ANGLE
    let shown = false
    let idleFor = 0
    let lastSpark = 0
    let sparkIdx = 0

    const shed = (x, y) => {
      const el = sparks[sparkIdx++ % EMBERS]
      gsap.killTweensOf(el)
      gsap.fromTo(el,
        { x: x + gsap.utils.random(-4, 4), y: y + gsap.utils.random(-4, 4), autoAlpha: 1, scale: gsap.utils.random(0.7, 1.4) },
        { x: `+=${gsap.utils.random(-10, 10)}`, y: `-=${gsap.utils.random(14, 32)}`, autoAlpha: 0, scale: 0.1, duration: gsap.utils.random(0.5, 0.85), ease: 'power1.out' })
    }

    // The blade is pinned to the pointer on every frame, so there is no follow lag at all. Only its
    // turn is eased: it swings toward the smoothed direction of travel.
    const tick = (time) => {
      const f = Math.min(gsap.ticker.deltaRatio(60), 4)
      const dx = target.x - prev.x
      const dy = target.y - prev.y
      prev.x = target.x
      prev.y = target.y
      vel.x += (dx - vel.x) * 0.3
      vel.y += (dy - vel.y) * 0.3
      const speed = Math.hypot(vel.x, vel.y)
      ring.current.style.translate = `${target.x}px ${target.y}px`

      let desired = REST_ANGLE
      if (speed > 1.2) {
        idleFor = 0
        desired = (Math.atan2(vel.y, vel.x) * 180) / Math.PI + 90
      } else {
        idleFor += (f * 1000) / 60
        if (idleFor < 350) desired = angle
      }
      // shortest-arc easing so a half-turn never spins the long way round
      const delta = ((desired - angle + 540) % 360) - 180
      angle += delta * (1 - (1 - 0.22) ** f)
      kunai.style.rotate = `${angle.toFixed(1)}deg`

      if (speed > 3 && time - lastSpark > 0.06) {
        lastSpark = time
        const rad = ((angle - 90) * Math.PI) / 180 // direction the tip faces
        shed(target.x - Math.cos(rad) * KUNAI_TAIL, target.y - Math.sin(rad) * KUNAI_TAIL)
      }
    }
    gsap.ticker.add(tick)

    const move = (e) => {
      target.x = e.clientX
      target.y = e.clientY
      ring.current.style.translate = `${target.x}px ${target.y}px` // placed in the event itself: zero frames of lag
      if (!shown) {
        shown = true
        prev.x = target.x // appear exactly under the pointer with no velocity
        prev.y = target.y
        gsap.to(ring.current, { autoAlpha: 1, duration: 0.3 })
      }
    }
    const over = (e) => {
      const el = e.target.closest?.(INTERACTIVE)
      if (!el) { setMode('idle'); setLabel(''); return }
      setMode(el.getAttribute('data-cursor') || 'link')
      setLabel(el.getAttribute('data-cursor-label') || '')
    }
    const leave = () => gsap.to(ring.current, { autoAlpha: 0, duration: 0.2, onComplete: () => { shown = false } })
    const down = () => ring.current.classList.add('is-down')
    const up = () => ring.current.classList.remove('is-down')

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over)
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      gsap.ticker.remove(tick)
      gsap.killTweensOf(sparks)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div className={`cursor cursor--${mode}`} aria-hidden="true">
      <span className="cursor__embers" ref={embers}>
        {Array.from({ length: EMBERS }).map((_, i) => <i key={i} />)}
      </span>
      <div className="cursor__ring" ref={ring}>
        <Kunai />
        <span className="cursor__label">{label}</span>
      </div>
    </div>
  )
}
