import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { riseChars } from '../animations/textAnimations'
import { identity } from '../data/identity'
import GardenTitle from './GardenTitle'
import { useScroll } from './SmoothScroll'
import maskMe from '../assets/zine/hollow-me.webp'
import '../styles/motionintro.css'

const WIPE_AT = 2.45 // the overlay starts lifting; the whole opener is 3.0s
const HAND_OVER = 2.55 // the hero's own entrance starts here (see Hero.jsx), under the lifting overlay

/**
 * The 3-second opener. H and M rise out of the dark and grow the garden's roses; the masked portrait pops out of a
 * crimson disc between them (the same H ◐ M as the logo); the Portfolio script writes itself in; then the page lifts
 * away and the hero takes over. Plays on every load unless motion is reduced; Enter, Escape, Space or a click skips it.
 * main.jsx marks <html data-intro="playing"> before first paint so the hero knows to wait.
 */
export default function MotionIntro() {
  const [play] = useState(() => document.documentElement.dataset.intro === 'playing')
  const [gone, setGone] = useState(false)
  const root = useRef(null)
  const tlRef = useRef(null)
  const { lock, unlock } = useScroll()

  useGSAP(() => {
    if (!play) return undefined
    const q = gsap.utils.selector(root)
    lock()
    let handed = false
    const handOver = () => { if (handed) return; handed = true; unlock(); window.dispatchEvent(new Event('intro:done')) }

    const tl = gsap.timeline({ onComplete: () => { handOver(); setGone(true) } })
    tlRef.current = tl
    tl.fromTo(q('.mi__dots'), { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0)
      .add(riseChars(q('.mi__hm .char'), { duration: 0.7, stagger: 0.08 }), 0.05)
      .fromTo(q('.mi__disc'), { scale: 0, rotate: -70 }, { scale: 1, rotate: 0, duration: 0.7, ease: 'back.out(1.9)' }, 0.5)
      .fromTo(q('.mi__face'), { yPercent: 28 }, { yPercent: 0, duration: 0.6, ease: 'back.out(2)' }, 0.7)
      .fromTo(q('.mi__script'), { clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% -12% -20% 0%)', duration: 0.6, ease: 'power2.out' }, 1.5)
      .fromTo(q('.mi__name'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.7)
      .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'expo.inOut' }, WIPE_AT)
      .call(handOver, null, HAND_OVER)

    return () => { tl.kill(); handOver() } // always let the hero go, even if this unmounts early
  }, { scope: root, dependencies: [play] })

  // jump to the lift
  const skip = () => { const tl = tlRef.current; if (tl && tl.time() < WIPE_AT) tl.time(WIPE_AT) }
  useEffect(() => {
    if (!play) return undefined
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [play])

  if (!play || gone) return null
  return (
    <div className="mi" ref={root} role="dialog" aria-label="Introduction" onClick={skip}>
      <span className="mi__dots" aria-hidden="true" />
      <div className="mi__lock" aria-hidden="true">
        <GardenTitle as="div" className="mi__hm" text="H M" garden="intro" />
        <span className="mi__disc"><img className="mi__face" src={maskMe} alt="" draggable="false" /></span>
      </div>
      <p className="mi__script" aria-hidden="true">Portfolio</p>
      <p className="mi__name" aria-hidden="true">{identity.firstName} {identity.lastName}</p>
      <button className="mi__skip" onClick={(e) => { e.stopPropagation(); skip() }}>Skip intro</button>
    </div>
  )
}
