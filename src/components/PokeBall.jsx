import { useEffect, useId, useRef } from 'react'
import { iconFor } from '../data/icons'
import '../styles/pokeball.css'

// One custom ball per skill: its own colours, its own pattern on the top half, its own band, and the skill's mark in
// the centre button. Top half is drawn in a 100×50 box; the band sits across the middle.
const BALLS = {
  'React.js': { // Tidal ball: cyan shell with atom orbits
    top: ['#5fe3ff', '#0a78c8'], bottom: '#d6f1fb', band: '#0b2a45', ring: '#7fe4ff', glyph: '#0aa6d8', pattern: 'orbit', pat: 'rgba(255,255,255,0.55)', glow: '#61dafb',
  },
  Symfony: { // Shadow ball: black shell, silver pinstripes
    top: ['#34343c', '#0a0a0d'], bottom: '#d9d9e0', band: '#a3a4ae', ring: '#ffffff', glyph: '#111111', pattern: 'stripes', pat: 'rgba(255,255,255,0.28)', glow: '#ffffff',
  },
  'Spring Boot': { // Leaf ball: green shell with leaf veins
    top: ['#9be85a', '#2c7a1c'], bottom: '#eafbe0', band: '#123d12', ring: '#c9ff9f', glyph: '#2f8a1f', pattern: 'veins', pat: 'rgba(235,255,210,0.55)', glow: '#6db33f',
  },
  MySQL: { // Dive ball: navy shell with waves and an orange band
    top: ['#2d6fb8', '#071c38'], bottom: '#e3f4ff', band: '#f29111', ring: '#9fd6ff', glyph: '#0d6aa5', pattern: 'waves', pat: 'rgba(150,215,255,0.55)', glow: '#4db6e6',
  },
  Linux: { // Ultra ball: yellow shell with black wings
    top: ['#ffe34a', '#e0a000'], bottom: '#f7f2de', band: '#141414', ring: '#ffd21f', glyph: '#141414', pattern: 'wings', pat: '#141414', glow: '#ffcc1f',
  },
  AWS: { // Quick ball: orange shell with a smile swoosh and a squid-ink band
    top: ['#ffb43a', '#e56a00'], bottom: '#fff3df', band: '#232f3e', ring: '#ffb43a', glyph: '#e07b00', pattern: 'swoosh', pat: '#232f3e', glow: '#ff9900',
  },
}

function Pattern({ kind, color }) {
  const line = { fill: 'none', stroke: color, strokeLinecap: 'round' }
  if (kind === 'orbit') return [0, 60, 120].map((r) => <ellipse key={r} cx="50" cy="30" rx="34" ry="12" transform={`rotate(${r} 50 30)`} {...line} strokeWidth="2.2" />)
  if (kind === 'stripes') return Array.from({ length: 12 }, (_, k) => <line key={k} x1={-40 + k * 10} y1="50" x2={10 + k * 10} y2="0" {...line} strokeWidth="2.2" />)
  if (kind === 'veins') {
    return (
      <>
        <path d="M50 4 L50 46" {...line} strokeWidth="2.4" />
        {[0, 1, 2, 3, 4].flatMap((k) => [
          <path key={`l${k}`} d={`M50 ${12 + k * 7.5} L34 ${6 + k * 7.5}`} {...line} strokeWidth="2" />,
          <path key={`r${k}`} d={`M50 ${12 + k * 7.5} L66 ${6 + k * 7.5}`} {...line} strokeWidth="2" />,
        ])}
      </>
    )
  }
  if (kind === 'waves') return [14, 25, 36].map((y) => <path key={y} d={`M-2 ${y} q6 -5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0`} {...line} strokeWidth="2" />)
  if (kind === 'wings') {
    return (
      <>
        <path d="M6 40 L30 8 L43 8 L22 46 Z" fill={color} />
        <path d="M94 40 L70 8 L57 8 L78 46 Z" fill={color} />
        <path d="M37 6 L50 24 L63 6 Z" fill={color} opacity="0.9" />
      </>
    )
  }
  return ( // swoosh
    <>
      <path d="M12 40 Q50 2 88 40" {...line} strokeWidth="5.5" />
      <path d="M24 44 Q50 20 76 44" {...line} strokeWidth="2.6" />
    </>
  )
}

/**
 * A Poké Ball for a skill. Pops in when it scrolls into view, rocks gently like a ball waiting to be thrown, and
 * shakes like a catch on hover. Decorative: the skill name is read from the list item that holds it.
 */
export default function PokeBall({ name, i = 0 }) {
  const id = useId().replace(/:/g, '')
  const ref = useRef(null)
  const hit = iconFor(name)
  const b = BALLS[name]

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect() } }, { rootMargin: '0px 0px -8% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!hit || !b) return null
  const { Icon } = hit
  return (
    <span ref={ref} className="pball" style={{ '--i': i, '--glow': b.glow }} aria-hidden="true">
      <svg className="pball__svg" viewBox="0 0 100 100" focusable="false">
        <defs>
          <radialGradient id={`${id}t`} cx="32%" cy="22%" r="90%"><stop offset="0" stopColor={b.top[0]} /><stop offset="1" stopColor={b.top[1]} /></radialGradient>
          <radialGradient id={`${id}b`} cx="38%" cy="32%" r="85%"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor={b.bottom} /></radialGradient>
          <radialGradient id={`${id}s`} cx="34%" cy="28%" r="80%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.34" /></radialGradient>
          <clipPath id={`${id}c`}><circle cx="50" cy="50" r="46" /></clipPath>
          <clipPath id={`${id}u`}><rect x="0" y="0" width="100" height="50" /></clipPath>
        </defs>
        <g clipPath={`url(#${id}c)`}>
          <rect width="100" height="100" fill={`url(#${id}b)`} />
          <g clipPath={`url(#${id}u)`}>
            <rect width="100" height="50" fill={`url(#${id}t)`} />
            <Pattern kind={b.pattern} color={b.pat} />
          </g>
          <rect x="0" y="43" width="100" height="14" fill={b.band} stroke="#111" strokeWidth="3" />
          <rect width="100" height="100" fill={`url(#${id}s)`} />
        </g>
        <circle cx="50" cy="50" r="46" fill="none" stroke="#111" strokeWidth="4" />
        <circle cx="50" cy="50" r="20.5" fill={b.band} stroke="#111" strokeWidth="4" />
        <circle cx="50" cy="50" r="15.5" fill="#f7f7fa" stroke={b.ring} strokeWidth="2.4" />
        <ellipse cx="32" cy="22" rx="14" ry="6.5" fill="#fff" opacity="0.5" transform="rotate(-32 32 22)" />
      </svg>
      <span className="pball__glyph" style={{ color: b.glyph }}><Icon /></span>
    </span>
  )
}
