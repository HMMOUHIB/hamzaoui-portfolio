import { useEffect, useRef } from 'react'
import '../styles/atmosphere.css'

// The air of portfolioref.mp4: sparse dust drifting in the dark, and big halftone shapes (a clover and a star) that
// slide past at their own speeds as you scroll. Ink is white on the dark theme and black on the light one.
const TAU = Math.PI * 2

function rng(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647 }
}

// A halftone sprite: a 45° dot lattice whose dots swell toward the middle of the shape and vanish at its edge.
function halftone(size, cell, sd, ink) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
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
  return c
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

export default function Atmosphere() {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    const g = cv.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const rand = rng(11)
    const dust = Array.from({ length: 120 }, () => ({ x: rand(), y: rand(), z: 0.25 + rand() * 0.75, r: 0.5 + rand() * 1.7, ph: rand() * TAU, v: 0.004 + rand() * 0.012 }))
    // base = where it sits (fraction of the viewport), f = scroll speed, a = ink opacity
    const shapes = [
      { fn: clover, size: 640, cell: 15, x: 0.82, y: 0.18, f: 0.10, a: 0.9, rot: -0.2 },
      { fn: star, size: 520, cell: 13, x: 0.1, y: 0.7, f: 0.16, a: 0.8, rot: 0.3 },
      { fn: clover, size: 460, cell: 13, x: 0.5, y: 1.05, f: 0.07, a: 0.7, rot: 0.6 },
    ]
    let W = 0; let H = 0; let ink = '236,236,240'; let sprites = []; let raf = 0; let last = 0
    const m = { x: 0, y: 0, tx: 0, ty: 0 }

    const theme = () => (document.documentElement.dataset.theme === 'light' ? { ink: '17,17,17', dust: 0.4, shape: 0.09 } : { ink: '236,236,240', dust: 0.6, shape: 0.12 })
    const build = () => {
      const t = theme(); ink = t.ink
      sprites = shapes.map((s) => halftone(s.size, s.cell, s.fn, ink))
    }
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      W = window.innerWidth; H = window.innerHeight
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now) => {
      const t = theme(); const sy = window.scrollY
      m.x += (m.tx - m.x) * 0.05; m.y += (m.ty - m.y) * 0.05
      g.clearRect(0, 0, W, H)
      shapes.forEach((s, i) => {
        const span = H + s.size
        const py = ((s.y * H - sy * s.f + s.size) % span + span) % span - s.size / 2
        const px = s.x * W + m.x * 22 * (i + 1) * 0.5
        g.save()
        g.globalAlpha = t.shape * s.a
        g.translate(px, py + m.y * 14 * (i + 1) * 0.5)
        g.rotate(s.rot + (reduced ? 0 : Math.sin(now / 9000 + i) * 0.05))
        g.drawImage(sprites[i], -s.size / 2, -s.size / 2)
        g.restore()
      })
      g.fillStyle = `rgb(${ink})`
      for (const d of dust) {
        const y = (((d.y - (reduced ? 0 : now * d.v * 0.0004) - sy * 0.00012 * d.z) % 1) + 1) % 1
        const a = t.dust * d.z * (reduced ? 0.8 : 0.45 + 0.55 * Math.sin(now / 1400 + d.ph))
        g.globalAlpha = Math.max(0, a)
        g.beginPath(); g.arc(d.x * W, y * H, d.r * d.z + 0.3, 0, TAU); g.fill()
      }
      g.globalAlpha = 1
    }

    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (document.hidden || now - last < 33) return // ~30 fps is plenty for drifting dust
      last = now
      draw(now)
    }
    const still = () => { if (!raf) requestAnimationFrame((n) => { draw(n); }) }

    size(); build(); draw(0)
    const onMove = (e) => { m.tx = e.clientX / W - 0.5; m.ty = e.clientY / H - 0.5 }
    const onResize = () => { size(); draw(performance.now()) }
    const themeWatch = new MutationObserver(() => { build(); draw(performance.now()) })
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('resize', onResize)
    if (reduced) window.addEventListener('scroll', still, { passive: true })
    else { window.addEventListener('pointermove', onMove, { passive: true }); raf = requestAnimationFrame(tick) }
    return () => {
      cancelAnimationFrame(raf); themeWatch.disconnect()
      window.removeEventListener('resize', onResize); window.removeEventListener('scroll', still); window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas className="atmo" ref={ref} aria-hidden="true" />
}
