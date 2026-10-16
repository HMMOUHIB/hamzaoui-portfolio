import { useRef } from 'react'
import { gsap, MQ, useGSAP } from '../animations/gsap'
import { buildIntroTimeline, headLoop, signatureLoop } from '../animations/heroAnimations'
import { identity } from '../data/identity'
import { useScroll } from './SmoothScroll'
import GardenTitle from './GardenTitle'
import SplitText from './SplitText'
import { Dingbats } from './Zine'
import headA from '../assets/zine/head-star.webp'
import headWink from '../assets/zine/head-star-wink.webp'
import '../styles/hero.css'

/**
 * The masthead (after mainref.mp4): kickers on the corners, PORTF◯LIO in the extended black with a manga-ink portrait
 * of Mouhib for the O (ref/logo2.png style: heavy ink in a star badge, star pupil; it winks), a handwritten
 * signature with an arrow, the dingbat row.
 */
export default function Hero() {
  const root = useRef(null)
  const { scrollTo } = useScroll()

  useGSAP(() => {
    const done = () => { document.documentElement.dataset.intro = 'done' }
    if (window.matchMedia(MQ.reduced).matches) { done(); return }
    const q = gsap.utils.selector(root)
    const tl = buildIntroTimeline(q, { onComplete: done }) // paused, with the hero already hidden
    headLoop(q)
    signatureLoop(q)
    // under the 3-second opener the entrance waits for its hand-over, so the reveal shows the hero arriving
    if (document.documentElement.dataset.intro !== 'playing') { tl.play(); return undefined }
    const go = () => tl.play()
    window.addEventListener('intro:done', go, { once: true })
    return () => window.removeEventListener('intro:done', go)
  }, { scope: root })

  const go = (id) => (e) => { e.preventDefault(); scrollTo(id) }

  return (
    <section id="top" className="mast" ref={root} aria-labelledby="hero-name">
      <p className="mast__kickers">
        <GardenTitle as="span" className="mast__role" text={`${identity.roles[1]} / Cloud`} garden="role" />
        <span>2026</span>
      </p>

      <h1 className="mast__word" id="hero-name">
        <span className="sr-only">{identity.lastName} {identity.firstName} — portfolio</span>
        <span className="mast__letters" aria-hidden="true">
          <SplitText text="PORTF" className="display" />
          <span className="mast__head">
            <img className="mast__face mast__face--a" src={headA} alt="" fetchPriority="high" draggable="false" />
            <img className="mast__face mast__face--b" src={headWink} alt="" draggable="false" />
            <span className="mast__sign">
              <svg className="mast__arrow" viewBox="0 0 60 80" focusable="false">
                <path d="M30 76 C 10 70 6 46 18 10 M 9 22 L 18 8 L 28 20" />
              </svg>
              <span className="mast__name">{identity.firstName} {identity.lastName}</span>
            </span>
          </span>
          <SplitText text="LIO" className="display" />
        </span>
      </h1>

      <Dingbats className="mast__dingbats" />

      <div className="mast__ctas">
        <a href="#origin" className="btn btn--primary" onClick={go('#origin')}>Explore the journey</a>
        <a href="#contact" className="btn btn--ghost" onClick={go('#contact')}>Contact me</a>
      </div>
    </section>
  )
}
