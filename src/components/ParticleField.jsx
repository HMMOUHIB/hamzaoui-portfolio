import { useEffect, useRef } from 'react'

/**
 * Drifting spirit-ash. Plain 2D canvas: cheap, capped DPR, paused when
 * off-screen or when the tab is hidden, one static frame for reduced motion.
 */
export default function ParticleField({ className = '', density = 1 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 899px)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let w = 0, h = 0, raf = 0, visible = true, particles = []

    const make = () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      vy: -(Math.random() * 0.25 + 0.05),
      vx: (Math.random() - 0.5) * 0.12,
      a: Math.random() * 0.6 + 0.15,
      hue: Math.random(), // <0.1 red, <0.22 blue, else ash
    })

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round((mobile ? 40 : 110) * density)
      particles = Array.from({ length: count }, make)
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w }
        ctx.globalAlpha = p.a
        ctx.fillStyle = p.hue < 0.1 ? '#e23a47' : p.hue < 0.22 ? '#4f8dff' : '#ece7df'
        ctx.fillRect(p.x, p.y, p.r, p.r)
      }
      ctx.globalAlpha = 1
    }

    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }
    const start = () => { if (!raf && visible && !document.hidden && !reduced) raf = requestAnimationFrame(loop) }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }

    resize()
    draw()
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop() })
    io.observe(canvas)
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    const ro = new ResizeObserver(() => { resize(); draw() })
    ro.observe(canvas)
    start()

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [density])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
