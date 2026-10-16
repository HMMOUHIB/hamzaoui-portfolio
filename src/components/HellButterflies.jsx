import { useRef } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { iconFor } from '../data/icons'
import '../styles/butterflies.css'

// Jigokuchō (Bleach's hell butterflies), each carrying one technology's mark in its own colour.
const FLOCK = [
  { name: 'React.js', color: '#61dafb' }, { name: 'JavaScript', color: '#f7df1e' }, { name: 'GSAP', color: '#88ce02' },
  { name: 'Symfony', color: '#f4f4f4' }, { name: 'Spring Boot', color: '#34d399' }, { name: 'MySQL', color: '#ff4fa3' },
  { name: 'Linux', color: '#a78bfa' }, { name: 'AWS', color: '#ff9900' }, { name: 'Kubernetes', color: '#4f86f7' },
]
const PHONE_FLOCK = ['React.js', 'JavaScript', 'Spring Boot', 'MySQL', 'Linux', 'AWS']

// left wings (the right ones are the same paths mirrored): a pointed forewing and a swallowtail hindwing
const FORE = 'M-2 -4C-14 -18-30-30-46-32C-44-22-40-10-32-3C-22 1-10 2-2 1Z'
const HIND = 'M-2 2C-14 2-28 4-32 12C-34 20-26 24-18 22C-16 30-14 36-12 42C-10 34-8 24-3 10Z'
const VEINS = 'M-3-2L-40-28M-3-1L-34-14M-3 0L-28-4M-3 4L-26 10M-3 5L-14 34'

function Wing({ side }) {
  return (
    <g className="hb__wing" style={{ '--side': side }}>
      <path className="hb__fill" d={FORE} /><path className="hb__fill" d={HIND} />
      <path className="hb__vein" d={VEINS} />
    </g>
  )
}

/** Decorative layer (the Mind stage): the flock wanders behind the verbs; paused while off screen. */
export default function HellButterflies() {
  const root = useRef(null)

  useGSAP(() => {
    const layer = root.current
    const mm = gsap.matchMedia()
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', phone: '(max-width: 899px)' }, (ctx) => {
      const { motion, phone } = ctx.conditions
      const birds = [...layer.querySelectorAll('.hb')].filter((el) => !phone || el.dataset.phone)
      const box = () => layer.getBoundingClientRect()
      // start spread out on a loose grid so they don't clump
      birds.forEach((el, i) => {
        const { width: w, height: h } = box()
        gsap.set(el, { x: ((i % 3) + 0.2 + Math.random() * 0.6) / 3 * w, y: (Math.floor(i / 3) + 0.2 + Math.random() * 0.6) / 3 * h, rotation: gsap.utils.random(-20, 20) })
      })
      if (!motion) return undefined
      const live = new Set()
      let visible = false
      const fly = (el) => {
        const { width: w, height: h } = box()
        const x0 = gsap.getProperty(el, 'x'), y0 = gsap.getProperty(el, 'y')
        const x = gsap.utils.random(0.04, 0.92) * w, y = gsap.utils.random(0.04, 0.9) * h
        const dist = Math.hypot(x - x0, y - y0)
        // drawn head-up: lean into the heading, never more than 40° off upright
        const rotation = gsap.utils.clamp(-40, 40, (Math.atan2(x - x0, y0 - y) * 180) / Math.PI)
        const t = gsap.to(el, { x, y, rotation, paused: !visible, duration: gsap.utils.clamp(3, 9, dist / gsap.utils.random(45, 80)), ease: 'sine.inOut', onComplete: () => { live.delete(t); fly(el) } })
        live.add(t)
      }
      birds.forEach((el, i) => {
        gsap.delayedCall(i * 0.35, () => fly(el))
        gsap.to(el.querySelector('.hb__bob'), { y: gsap.utils.random(-14, -6), duration: gsap.utils.random(0.9, 1.6), ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })
      // an observer, not a ScrollTrigger: the layer may sit inside a pinned stage, and IO sees its real position
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting
        layer.classList.toggle('is-live', visible)
        live.forEach((t) => (visible ? t.resume() : t.pause()))
      })
      io.observe(layer)
      return () => io.disconnect()
    })
  }, { scope: root })

  return (
    <div className="hb-layer" ref={root} aria-hidden="true">
      {FLOCK.map(({ name, color }, i) => {
        const { Icon } = iconFor(name)
        return (
          <div className="hb" key={name} data-phone={PHONE_FLOCK.includes(name) || undefined} style={{ '--c': color, '--flap': `${0.38 + (i % 4) * 0.07}s` }}>
            <div className="hb__bob">
              <svg className="hb__svg" viewBox="-50 -46 100 92">
                <Wing side={1} /><Wing side={-1} />
                <path className="hb__antenna" d="M-1-12C-4-22-8-27-12-30M1-12C4-22 8-27 12-30" />
                <ellipse className="hb__body" cx="0" cy="2" rx="2.4" ry="13" />
              </svg>
              <span className="hb__seal"><Icon /></span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
