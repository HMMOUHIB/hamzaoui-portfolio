import { useEffect, useRef } from 'react'
import './AnimatedLogo.css'

/**
 * The HM monogram: two counter-rotating rings, an orbiting spark, and the
 * letters drawing themselves once the mark scrolls into view. Colours come
 * from the site-wide pulse (--glow / --glow-b), so it breathes with everything else.
 */
export default function AnimatedLogo({ className = '', ink = false, neon = false, auto = true, label = 'Hamzaoui Mouhib monogram' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !auto) return undefined // auto={false}: the parent adds .is-in when it wants the letters drawn
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect() }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [auto])

  return (
    <svg ref={ref} className={`alogo${ink ? ' alogo--ink' : ''}${neon ? ' alogo--neon' : ''} ${className}`.trim()} viewBox="0 0 120 120" role="img" aria-label={label}>
      <defs>
        <linearGradient id="alogo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--glow)' }} />
          <stop offset="1" style={{ stopColor: 'var(--glow-b)' }} />
        </linearGradient>
      </defs>

      <g className="alogo__ring alogo__ring--a">
        <circle cx="60" cy="60" r="55" />
        <circle className="alogo__spark" cx="60" cy="5" r="3.2" />
      </g>
      <g className="alogo__ring alogo__ring--b">
        <circle cx="60" cy="60" r="47" />
      </g>

      <g className="alogo__hm">
        <path d="M32 42 V80 M32 61 H51 M51 42 V80" />
        <path d="M63 80 V42 L75.5 64 L88 42 V80" />
      </g>
      <path className="alogo__slash" d="M94 38 L100 26" />
    </svg>
  )
}
