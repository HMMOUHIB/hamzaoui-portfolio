import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../animations/gsap'
import { useScroll } from './SmoothScroll'
import AnimatedLogo from './ReactBit/AnimatedLogo'
import gastlySrc from '../assets/gastly.gif'
import '../styles/intro.css'

// gastly.gif: 28 frames at 80ms; the evolution completes and its feet land at 2.16s, then the last
// frame holds for 3s (until 5.16s). Everything below is timed against those two numbers.
const FLOOR_AT = 2.16 // the feet hit the floor: the mark enters on that exact beat
const ENTER_AT = 4.6 // the mark has finished drawing and held; the site opens
const FADE = 0.55 // overlay dissolve — over before the GIF loops back to its first frame at 5.16s
const MAX_WAIT = 1500 // ms to wait for the GIF to load before starting anyway

// Plays on every load and reload; only users who ask for reduced motion skip it.
function shouldPlay() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * First-load opener. The evolving ghost plays in the middle of the page. On the beat its feet land on
 * the floor, a ripple spreads and the neon HM mark enters right beneath them, drawing itself at the
 * GIF's own snappy pace. Once the mark is fully drawn and has held for a moment, the whole opener
 * dissolves into the hero. The GIF is only attached once it has decoded, so its animation starts
 * exactly with the timeline.
 */
export default function IntroVideo({ onDone }) {
  const [play] = useState(shouldPlay)
  const [loaded, setLoaded] = useState(false)
  const [gone, setGone] = useState(false) // unmount at the end so the animated image stops decoding
  const root = useRef(null)
  const tlRef = useRef(null)
  const { lock, unlock } = useScroll()

  // Nothing to show: hand over immediately.
  useEffect(() => { if (!play) onDone() }, [play, onDone])

  // Decode the GIF off-screen first (or give up waiting after MAX_WAIT).
  useEffect(() => {
    if (!play) return undefined
    let done = false
    const go = () => { if (!done) { done = true; setLoaded(true) } }
    const im = new Image()
    im.src = gastlySrc
    ;(im.decode ? im.decode() : Promise.resolve()).then(go, go)
    const t = setTimeout(go, MAX_WAIT)
    return () => clearTimeout(t)
  }, [play])

  useGSAP(() => {
    if (!play) return undefined
    const q = gsap.utils.selector(root)
    const logo = root.current.querySelector('.intro__logo')
    const html = document.documentElement
    html.classList.add('is-intro') // pauses the site-wide colour pulse while the opener plays
    lock()

    // Release the scroll lock exactly once, just before the hero takes over and locks it again itself.
    let released = false
    const release = () => { if (!released) { released = true; unlock(); html.classList.remove('is-intro') } }

    const tl = gsap.timeline({
      paused: true,
      onComplete: () => setGone(true),
    })
    tlRef.current = tl
    tl.fromTo(q('.intro__aura'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'power1.out' }, 0)
      .fromTo(q('.intro__gastly'), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power2.out' }, 0)
      // the beat: feet on the floor. A ripple spreads and the mark lands under them.
      .fromTo(q('.intro__wave'), { autoAlpha: 0.9, scaleX: 0.3, scaleY: 0.08 }, { autoAlpha: 0, scaleX: 2.4, scaleY: 0.68, duration: 0.9, ease: 'power2.out', immediateRender: false }, FLOOR_AT)
      .call(() => logo.classList.add('is-in'), null, FLOOR_AT) // starts the letters drawing (see intro.css for the pace)
      .fromTo(logo, { autoAlpha: 0, scale: 0.6, y: -16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.36, ease: 'back.out(2.2)' }, FLOOR_AT)
      // the site opens
      .call(() => { release(); onDone() }, null, ENTER_AT)
      .to(root.current, { autoAlpha: 0, duration: FADE, ease: 'power2.inOut' }, ENTER_AT)

    return () => { tl.kill(); gsap.killTweensOf(logo); release() }
  }, { scope: root, dependencies: [play] })

  // Start together with the GIF: it was attached on this very render.
  useEffect(() => {
    if (!loaded) return undefined
    const id = requestAnimationFrame(() => tlRef.current?.play(0))
    return () => cancelAnimationFrame(id)
  }, [loaded])

  // Skip jumps straight to the moment the site opens.
  const skip = () => { const tl = tlRef.current; if (tl) tl.time(Math.max(tl.time(), ENTER_AT - 0.05)) }

  // Enter, Escape or Space skips.
  useEffect(() => {
    if (!play) return undefined
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [play])

  if (!play || gone) return null
  return (
    <div className="intro" ref={root} role="dialog" aria-label="Introduction">
      <div className="intro__shade" aria-hidden="true" />
      {/* One square stage shared by the GIF and the mark, so "under its feet" holds at any window size */}
      <div className="intro__stage" aria-hidden="true">
        <span className="intro__aura" />
        <img className="intro__gastly" src={loaded ? gastlySrc : undefined} alt="" decoding="async" draggable="false" />
        <span className="intro__wave" />
        <AnimatedLogo neon auto={false} className="intro__logo" label="Hamzaoui Mouhib" />
      </div>
      <button className="intro__skip" onClick={skip}>Skip intro</button>
    </div>
  )
}
