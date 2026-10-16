import { useRef } from 'react'
import { gsap, MQ, useGSAP } from '../animations/gsap'
// the profile cut-out wearing the glass headset from ref/casq.mp4 (baked in, so strips/dissolve include it)
import profileSrc from '../assets/profile-casque.webp'
import haloSrc from '../assets/casque-glow.webp'
import hollowsSrc from '../assets/bleach/hollows.webp'
import HollowMask from './HollowMask'
import ProfileFigure from './ProfileFigure'
import '../styles/transformation.css'

const STRIPS = 7
const STAGES = ['Frontend', 'Full-Stack', 'Cloud']

/**
 * The inner-power sequence. A metaphor, scrubbed by scroll:
 * glow → shadow → mask shard → fracture → particles escape.
 * Frontend → Full-Stack → Cloud.
 */
export default function Transformation() {
  const root = useRef(null)
  const canvas = useRef(null)
  const figure = useRef(null)

  useGSAP(() => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
      const { desktop } = ctx.conditions
      root.current.classList.add('is-animated')
      const field = createDissolve(canvas.current, figure.current, desktop ? 1800 : 650)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: desktop ? '+=260%' : '+=180%',
          pin: true,
          scrub: 0.6,
          onRefresh: () => field.sample(),
        },
      })

      tl.fromTo(q('.tf__hollows'), { autoAlpha: 0, scale: 1.18, xPercent: -5 }, { autoAlpha: 0.25, scale: 1, xPercent: 5, duration: 5.2 }, 0)
        .to(q('.tf__glow'), { autoAlpha: 1, scale: 1.15, duration: 1 }, 0)
        .to(q('.tf__shade'), { autoAlpha: 0.85, duration: 1 }, 0.8)
        .to(q('.tf__stage-word')[0], { autoAlpha: 0, yPercent: -30, duration: 0.5 }, 1.4)
        .fromTo(q('.tf__stage-word')[1], { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.5 }, 1.6)
        .fromTo(q('.tf__mask'), { autoAlpha: 0, scale: 0.6, rotate: -18, clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)' },
          { autoAlpha: 1, scale: 1, rotate: 6, clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1, ease: 'power2.out' }, 1.6)
        .to(q('.tf__strip'), { x: (i) => (i % 2 ? 1 : -1) * (desktop ? 36 : 18) * (1 + (i % 3)), duration: 0.8, ease: 'power2.in' }, 2.6)
        .to(q('.tf__figure .pf, .tf__halo'), { autoAlpha: 0, duration: 0.2 }, 2.6)
        .to(q('.tf__strip'), { autoAlpha: 0, duration: 0.6, stagger: 0.05 }, 3.3)
        .to(q('.tf__mask'), { autoAlpha: 0, scale: 1.3, rotate: 14, duration: 0.8, ease: 'power2.in' }, 3.4)
        .to(field.state, { p: 1, duration: 1.6, onUpdate: field.draw }, 3.2)
        .to(q('.tf__stage-word')[1], { autoAlpha: 0, yPercent: -30, duration: 0.5 }, 3.6)
        .fromTo(q('.tf__stage-word')[2], { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.5 }, 3.8)
        .to(q('.tf__glow'), { autoAlpha: 0.2, duration: 0.8 }, 4)
        .fromTo(q('.tf__flash'), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: 'expo.in' }, 4.5)
        .to(q('.tf__flash'), { scaleY: 0, duration: 0.3 }, 4.9)

      return () => { root.current?.classList.remove('is-animated'); field.destroy() }
    })
  }, { scope: root })

  return (
    <section className="tf" ref={root} aria-label="Interlude: from frontend to full-stack to cloud">
      <img className="tf__hollows" src={hollowsSrc} alt="" loading="lazy" decoding="async" draggable="false" />
      <div className="tf__glow" aria-hidden="true" />
      <p className="tf__stages" aria-hidden="true">
        {STAGES.map((s) => <span className="tf__stage-word" key={s}>{s}</span>)}
      </p>

      <div className="tf__figure" ref={figure} style={{ '--src': `url("${profileSrc}")` }}>
        <ProfileFigure variant="hero" decorative src={profileSrc} />
        <img className="tf__halo" src={haloSrc} alt="" loading="lazy" decoding="async" draggable="false" />
        <div className="tf__strips" aria-hidden="true">
          {Array.from({ length: STRIPS }, (_, i) => (
            <span
              key={i}
              className="tf__strip"
              style={{
                clipPath: `inset(${(i / STRIPS) * 100}% 0% ${100 - ((i + 1) / STRIPS) * 100}% 0%)`,
              }}
            />
          ))}
        </div>
        <div className="tf__shade" aria-hidden="true" />
        <HollowMask className="tf__mask" />
      </div>

      <canvas className="tf__particles" ref={canvas} aria-hidden="true" />
      <span className="tf__flash" aria-hidden="true" />

      <p className="tf__caption">
        Every stage keeps what the last one learned.
        <span>Frontend → Full-Stack → Cloud</span>
      </p>
    </section>
  )
}

/**
 * Samples the portrait's opaque pixels and lets them drift away as `state.p`
 * goes 0 → 1. Drawn only when the scrubbed timeline updates — no idle loop.
 */
function createDissolve(canvas, figureEl, maxPoints) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const state = { p: 0 }
  let points = []
  let w = 0, h = 0
  const img = new Image()
  img.src = profileSrc

  const sample = () => {
    if (!img.complete || !img.naturalWidth) return
    const stage = canvas.getBoundingClientRect()
    w = stage.width; h = stage.height
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Where the image actually renders inside the figure box (object-fit: contain, bottom-aligned).
    const box = figureEl.getBoundingClientRect()
    const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight)
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale
    const ox = box.left - stage.left + (box.width - dw) / 2
    const oy = box.top - stage.top + (box.height - dh)

    const sw = 160, sh = Math.round(160 * (img.naturalHeight / img.naturalWidth))
    const off = document.createElement('canvas')
    off.width = sw; off.height = sh
    const octx = off.getContext('2d', { willReadFrequently: true })
    octx.drawImage(img, 0, 0, sw, sh)
    let data
    try { data = octx.getImageData(0, 0, sw, sh).data } catch { return }

    const candidates = []
    for (let y = 0; y < sh; y += 1) {
      for (let x = 0; x < sw; x += 1) {
        const i = (y * sw + x) * 4
        if (data[i + 3] > 140) candidates.push([x, y, (data[i] + data[i + 1] + data[i + 2]) / 765])
      }
    }
    const step = Math.max(1, candidates.length / maxPoints)
    points = []
    for (let k = 0; k < candidates.length; k += step) {
      const [x, y, lum] = candidates[Math.floor(k)]
      const px = ox + (x / sw) * dw, py = oy + (y / sh) * dh
      points.push({
        x: px, y: py,
        // Upward and outward — energy leaving the body.
        vx: (Math.random() - 0.3) * 0.6 * w,
        vy: -(Math.random() * 0.7 + 0.2) * h,
        delay: (1 - y / sh) * 0.35 + Math.random() * 0.15,
        s: Math.random() * 1.6 + 0.6,
        red: Math.random() < 0.3,
        blue: Math.random() < 0.5,
        lum: 0.35 + lum * 0.65,
      })
    }
    draw()
  }

  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    const p = state.p
    if (p <= 0) return
    for (const pt of points) {
      const local = Math.min(1, Math.max(0, (p - pt.delay) / (1 - pt.delay)))
      const e = local * local * (3 - 2 * local)
      const a = local === 0 ? Math.min(1, p * 6) : 1 - e
      if (a <= 0.01) continue
      ctx.globalAlpha = a * pt.lum
      ctx.fillStyle = pt.red ? (pt.blue ? '#4f8dff' : '#e23a47') : '#ece7df'
      ctx.fillRect(pt.x + pt.vx * e, pt.y + pt.vy * e, pt.s, pt.s)
    }
    ctx.globalAlpha = 1
  }

  img.onload = sample
  if (img.complete) sample()

  return { state, sample, draw, destroy: () => { img.onload = null; points = [] } }
}
