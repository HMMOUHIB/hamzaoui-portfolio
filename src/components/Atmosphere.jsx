import { useEffect, useRef } from 'react'
import '../styles/atmosphere.css'

// The air of portfolioref.mp4: sparse dust drifting in the dark, and big halftone shapes (a clover and a star) that slide
// past at their own speeds as you scroll. Ink is white on the dark theme and black on the light one.
// Nothing here is repainted per frame: every layer is drawn once (and again only on resize or theme change); scroll and
// pointer just update CSS transforms, and the dust drifts and twinkles in CSS, so all motion runs on the compositor.
const TAU = Math.PI * 2

function rng(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
}

// A halftone sprite: a 45° dot lattice whose dots swell toward the middle of the shape and vanish at its edge.
function halftone(cv, size, cell, sd, ink) {
  cv.width = cv.height = size
  const g = cv.getContext('2d')
  g.clearRect(0, 0, size, size)
  g.fillStyle = `rgb(${ink})`
  const half = size / 2
  for (let j = -size / cell; j < size / cell; j++) {
    for (let i = -size / cell; i < size / cell; i++) {
      const x = half + (i + (j & 1 ? 0.5 : 0)) * cell
      const y = half + j * cell * 0.5
      const d = sd((x - half) / half, (y - half) / half) // -1 deep inside .. 0 edge
      const r = Math.min(cell * 0.56, -d * cell * 1.9)
      if (r < 0.5) continue
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill()
    }
  }
}

const clover = (x, y) => { // four overlapping lobes
  let d = 9
  for (let k = 0; k < 4; k++) { const a = k * (TAU / 4) + Math.PI / 4; d = Math.min(d, Math.hypot(x - Math.cos(a) * 0.36, y - Math.sin(a) * 0.36) - 0.4) }
  return d
}
const star = (x, y) => { // five points, sharp
  const a = Math.atan2(y, x) + Math.PI / 2
  const t = Math.abs(((a / (TAU / 5)) % 1 + 1) % 1 - 0.5) * 2 // 0 at a point, 1 in a notch
  return Math.hypot(x, y) - (0.92 - 0.55 * t)
}

// base = where it sits (fraction of the viewport), f = scroll speed, a = ink opacity, rot = resting tilt
const SHAPES = [
  { fn: clover, size: 640, cell: 15, x: 0.82, y: 0.18, f: 0.10, a: 0.9, rot: -0.2 },
  { fn: star, size: 520, cell: 13, x: 0.1, y: 0.7, f: 0.16, a: 0.8, rot: 0.3 },
  { fn: clover, size: 460, cell: 13, x: 0.5, y: 1.05, f: 0.07, a: 0.7, rot: 0.6 },
]
const DUST = 110

export default function Atmosphere() {
  const root = useRef(null)

  useEffect(() => {
    const el = root.current
    const shapeEls = [...el.querySelectorAll('.atmo__shape')]
    const dustEls = [...el.querySelectorAll('.atmo__dust')]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const light = () => document.documentElement.dataset.theme === 'light'
    let W = window.innerWidth; let H = window.innerHeight
    const m = { x: 0, y: 0, tx: 0, ty: 0 }
    let raf = 0

    const drawShapes = () => {
      const ink = light() ? '17,17,17' : '236,236,240'
      const alpha = light() ? 0.09 : 0.12
      shapeEls.forEach((cv, i) => { const s = SHAPES[i]; halftone(cv, s.size, s.cell, s.fn, ink); cv.style.opacity = String(alpha * s.a) })
    }
    // two dust tiles at different speeds (a far and a near layer), each the size of the viewport
    const drawDust = () => {
      const ink = light() ? '17,17,17' : '236,236,240'
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      dustEls.forEach((cv, layer) => {
        const Hc = H * 1.1 // 10% taller than the screen: the drift never uncovers an empty strip
        cv.width = Math.round(W * dpr); cv.height = Math.round(Hc * dpr)
        const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = `rgb(${ink})`
        const rand = rng(11 + layer * 97)
        for (let i = 0; i < DUST / (layer + 1.4); i++) {
          const z = 0.25 + rand() * 0.75
          g.globalAlpha = (light() ? 0.4 : 0.6) * z
          g.beginPath(); g.arc(rand() * W, rand() * Hc, (0.5 + rand() * 1.7) * z * (layer ? 1.25 : 0.8) + 0.3, 0, TAU); g.fill()
        }
      })
    }

    const place = () => {
      raf = 0
      m.x += (m.tx - m.x) * 0.12; m.y += (m.ty - m.y) * 0.12
      const sy = window.scrollY
      shapeEls.forEach((cv, i) => {
        const s = SHAPES[i]; const span = H + s.size
        const py = ((s.y * H - sy * s.f + s.size) % span + span) % span - s.size / 2
        const px = s.x * W + m.x * 22 * (i + 1) * 0.5
        cv.style.transform = `translate3d(${(px - s.size / 2).toFixed(1)}px, ${(py - s.size / 2 + m.y * 14 * (i + 1) * 0.5).toFixed(1)}px, 0) rotate(${s.rot}rad)`
      })
      if (Math.abs(m.tx - m.x) + Math.abs(m.ty - m.y) > 0.002) raf = requestAnimationFrame(place) // ease the pointer drift, then rest
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(place) }

    const onMove = (e) => { m.tx = e.clientX / W - 0.5; m.ty = e.clientY / H - 0.5; queue() }
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; drawDust(); place() }
    const themeWatch = new MutationObserver(() => { drawShapes(); drawDust() })
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    drawShapes(); drawDust(); place()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', queue, { passive: true })
    if (!reduced) window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf); themeWatch.disconnect()
      window.removeEventListener('resize', onResize); window.removeEventListener('scroll', queue); window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div className="atmo" ref={root} aria-hidden="true">
      {SHAPES.map((_, i) => <canvas className="atmo__shape" key={i} />)}
      <canvas className="atmo__dust atmo__dust--far" />
      <canvas className="atmo__dust atmo__dust--near" />
    </div>
  )
}
