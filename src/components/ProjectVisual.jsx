import { useEffect, useRef } from 'react'

// Each project gets its own generative mark instead of a stock mockup, unless it has a product film.

function Film({ src, poster }) {
  // Muted preview loop: loads and plays only while on screen; reduced motion keeps the poster.
  const ref = useRef(null)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const v = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.35 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" disablePictureInPicture />
}

function Hive() {
  // Honeycomb lattice — one cell burns red.
  const cells = []
  const r = 26
  const w = Math.sqrt(3) * r
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 12; col++) {
      const x = col * w + (row % 2 ? w / 2 : 0) + 10
      const y = row * r * 1.5 + 10
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k - Math.PI / 6
        return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`
      }).join(' ')
      const hot = row === 4 && col === 6
      const lit = !hot && ((row * 7 + col * 3) % 11 === 0)
      cells.push(<polygon key={`${row}-${col}`} points={pts} className={hot ? 'pv-hot' : lit ? 'pv-lit' : 'pv-cell'} style={{ '--d': `${(row + col) * 0.07}s` }} />)
    }
  }
  return <svg viewBox="0 0 520 360" preserveAspectRatio="xMidYMid slice">{cells}</svg>
}

function Aura() {
  // Concentric fields warping around a single presence.
  const rings = Array.from({ length: 16 }, (_, i) => {
    const rx = 30 + i * 18
    const ry = 22 + i * 13
    return <ellipse key={i} cx="260" cy="190" rx={rx} ry={ry} className={i === 5 ? 'pv-hot-stroke' : 'pv-ring'} style={{ '--d': `${i * 0.12}s` }} transform={`rotate(${-8 + i * 1.2} 260 190)`} />
  })
  return (
    <svg viewBox="0 0 520 360" preserveAspectRatio="xMidYMid slice">
      {rings}
      <circle cx="260" cy="190" r="6" className="pv-core" />
    </svg>
  )
}

function Nexus() {
  // Deterministic constellation — nodes converging on a single knot.
  const nodes = Array.from({ length: 28 }, (_, i) => {
    const a = i * 2.39996
    const d = 30 + (i * 37) % 150
    return { x: 260 + Math.cos(a) * d * 1.4, y: 180 + Math.sin(a) * d * 0.9 }
  })
  return (
    <svg viewBox="0 0 520 360" preserveAspectRatio="xMidYMid slice">
      {nodes.map((n, i) => (
        <line key={`l${i}`} x1="260" y1="180" x2={n.x} y2={n.y} className={i % 9 === 0 ? 'pv-hot-stroke' : 'pv-link'} style={{ '--d': `${i * 0.05}s` }} />
      ))}
      {nodes.map((n, i) => <circle key={`n${i}`} cx={n.x} cy={n.y} r={i % 5 === 0 ? 3.5 : 2} className="pv-node" />)}
      <rect x="250" y="170" width="20" height="20" className="pv-knot" transform="rotate(45 260 180)" />
    </svg>
  )
}

const VISUALS = { hive: Hive, aura: Aura, nexus: Nexus }

export default function ProjectVisual({ type, film }) {
  if (film) {
    return (
      <div className="pv pv--film" aria-hidden="true">
        <Film src={film.src} poster={film.poster} />
      </div>
    )
  }
  const V = VISUALS[type] ?? Hive
  return (
    <div className={`pv pv--${type}`} aria-hidden="true">
      <V />
    </div>
  )
}
