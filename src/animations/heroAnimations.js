import { gsap } from './gsap'
import { riseChars } from './textAnimations'

/** Masthead entrance, ~1.4s: letters rise, the ink head pops in, kickers and dingbats land, actions last. */
export function buildIntroTimeline(q, { onComplete }) {
  return gsap.timeline({ paused: true, onComplete })
    .add(riseChars(q('.mast__word .char'), { duration: 0.9, stagger: 0.045 }), 0)
    .fromTo(q('.mast__head'), { autoAlpha: 0, scale: 0.4, rotate: -14 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.8)' }, 0.25)
    .fromTo(q('.mast__kickers > span'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.35)
    .fromTo(q('.mast__dingbats svg'), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }, 0.5)
    .fromTo(q('.mast__ctas > *'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.7)
}

/** The portrait in the O winks, then holds open for 3s: a stepped swap to the closed-eye frame for 0.15s. */
export function headLoop(q) {
  const [open, shut] = [q('.mast__face--a'), q('.mast__face--b')]
  return gsap.timeline({ repeat: -1, delay: 1 })
    .set(open, { autoAlpha: 0 }, 0).set(shut, { autoAlpha: 1 }, 0)
    .set(shut, { autoAlpha: 0 }, 0.15).set(open, { autoAlpha: 1 }, 0.15)
    .set({}, {}, 3.15)
}

/** Signature: the arrow draws, the name writes itself left to right, holds, erases right to left, repeats. */
export function signatureLoop(q) {
  const path = q('.mast__arrow path')[0]
  const name = q('.mast__name')
  const len = path.getTotalLength?.() || 120
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
  gsap.set(name, { clipPath: 'inset(-20% 100% -20% 0%)' })
  return gsap.timeline({ repeat: -1, repeatDelay: 0.8, delay: 0.9 })
    .to(path, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' })
    .to(name, { clipPath: 'inset(-20% 0% -20% 0%)', duration: 1.5, ease: 'none' })
    .to(name, { clipPath: 'inset(-20% 100% -20% 0%)', duration: 0.9, ease: 'power1.in' }, '+=6.5')
    .to(path, { strokeDashoffset: len, duration: 0.4, ease: 'power1.in' })
}
